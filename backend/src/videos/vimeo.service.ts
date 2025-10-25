import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';

@Injectable()
export class VimeoService {
  private readonly accessToken: string;
  private readonly baseUrl = 'https://api.vimeo.com';

  constructor(private config: ConfigService) {
    this.accessToken = this.config.get<string>('VIMEO_ACCESS_TOKEN') || '';
    if (!this.accessToken) {
      console.warn('[VIMEO] Access token not configured. Video uploads will fail.');
    }
  }

  /**
   * Upload video to Vimeo
   * @param file - Video file buffer
   * @param metadata - Video metadata (name, description)
   * @returns Video URL and Vimeo ID
   */
  async uploadVideo(
    file: Express.Multer.File,
    metadata: { name: string; description?: string },
  ): Promise<{ videoUrl: string; videoId: string }> {
    try {
      // Step 1: Create upload ticket
      const createResponse = await fetch(`${this.baseUrl}/me/videos`, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
        body: JSON.stringify({
          upload: {
            approach: 'tus',
            size: file.size.toString(),
          },
          name: metadata.name,
          description: metadata.description || '',
          privacy: {
            view: 'anybody', // Public video
          },
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Vimeo upload ticket creation failed: ${error}`);
      }

      const createData = await createResponse.json();
      const uploadLink = createData.upload.upload_link;
      const videoUri = createData.uri;
      const videoId = videoUri.split('/').pop();

      // Step 2: Upload video using TUS protocol
      const uploadResponse = await fetch(uploadLink, {
        method: 'PATCH',
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': '0',
          'Content-Type': 'application/offset+octet-stream',
        },
        body: file.buffer as any,
      });

      if (!uploadResponse.ok) {
        throw new Error('Vimeo video upload failed');
      }

      // Step 3: Return video URL (player URL for embedding)
      const videoUrl = `https://player.vimeo.com/video/${videoId}`;

      return { videoUrl, videoId };
    } catch (error) {
      console.error('[VIMEO] Upload error:', error);
      throw new BadRequestException('Failed to upload video to Vimeo: ' + error.message);
    }
  }

  /**
   * Get video details using oEmbed API (no auth required)
   * @param videoId - Vimeo video ID
   * @returns Video details including duration and thumbnail
   */
  async getVideoDetails(videoId: string): Promise<{
    duration: number;
    thumbnailUrl: string | null;
  }> {
    try {
      // Try oEmbed API first (no authentication required)
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`;
      const oembedResponse = await fetch(oembedUrl);

      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json();
        
        // Try to get precise duration from authenticated API if available
        let duration = oembedData.duration || 0;
        
        if (this.accessToken) {
          try {
            const detailsResponse = await fetch(`${this.baseUrl}/videos/${videoId}`, {
              headers: {
                Authorization: `bearer ${this.accessToken}`,
                Accept: 'application/vnd.vimeo.*+json;version=3.4',
              },
            });
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              duration = detailsData.duration || duration;
            }
          } catch (err) {
            console.warn('[VIMEO] Using oEmbed duration (authenticated API unavailable)');
          }
        }

        return {
          duration,
          thumbnailUrl: oembedData.thumbnail_url || null,
        };
      }

      // Fallback to authenticated API if oEmbed fails
      if (this.accessToken) {
        const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
          headers: {
            Authorization: `bearer ${this.accessToken}`,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch video details from Vimeo');
        }

        const data = await response.json();

        return {
          duration: data.duration || 0,
          thumbnailUrl: data.pictures?.sizes?.[3]?.link || null,
        };
      }

      throw new Error('Could not fetch video details from Vimeo');
    } catch (error) {
      console.error('[VIMEO] Get details error:', error);
      throw new BadRequestException('Failed to get video details from Vimeo');
    }
  }

  /**
   * Delete video from Vimeo
   * @param videoId - Vimeo video ID
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `bearer ${this.accessToken}`,
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete video from Vimeo');
      }
    } catch (error) {
      console.error('[VIMEO] Delete error:', error);
      // Don't throw error if video already deleted
      if (error.message.includes('404')) {
        return;
      }
      throw new BadRequestException('Failed to delete video from Vimeo');
    }
  }
}
