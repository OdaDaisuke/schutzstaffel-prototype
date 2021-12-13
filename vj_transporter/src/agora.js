import AgoraRTC from "agora-rtc-sdk-ng"
import { appConfig } from './config'

export class Agora {
  constructor() {
    this.appId = appConfig.APP_ID;
    this.appCertificate = appConfig.APP_CERTIFICATE;
    this.tokenApiUrl = `${appConfig.API_BASE_URL}/access_token`;
    this.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    this.handleUserPublished = this.handleUserPublished.bind(this);
    this.client.on("user-published", this.handleUserPublished);
  }

  async handleUserPublished(user, mediaType) {
    console.log('[SSVJ]user-published')
    await this.client.subscribe(user, mediaType);
    const event = new CustomEvent("received-remote-stream", {
      detail: {
        user,
        mediaType,
      },
    });
    document.dispatchEvent(event);
  }
  
  async publish() {
    if (!this.audioTrack) {
      throw new Error('No audio track detected.')
    }
    const localTracks = {
      videoTrack: AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: this.videoTrack,
      }),
      audioTrack: AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: this.audioTrack,
      }),
    };
    await this.client.setClientRole("host");
    const token = await this.fetchToken(this.channelName);
    const uid = await this.client.join(token, this.channelName, null);
    this.client.publish(Object.values(localTracks));
    return uid;
  }

  /**
   * 映像トラックを設定
   * @param {Object} videoTrack 
   */
   setVideo(videoTrack) {
    this.videoTrack = videoTrack;
  }

  /**
   * 音声トラックを設定
   * @param {Object} audioTrack 
   */
   setAudio(audioTrack) {
    this.audioTrack = audioTrack;
  }

  /**
   * チャンネルに讃歌
   */
  async joinChannel(channelName) {
    this.channelName = channelName
    await this.client.setClientRole("host");
    const token = await this.fetchToken(channelName);
    const uid = await this.client.join(token, channelName, null);
    return uid;
  }

  async fetchToken(channelName) {
    const endpoint = `${this.tokenApiUrl}?channelName=${channelName}`
    const res = await fetch(endpoint, {
      method: 'GET',
    });
    const rawData = await res.json();
    return rawData.token;
  }
}
