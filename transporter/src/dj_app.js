import { Agora, AGORA_MODE_RTC } from './agora';

class App {
  constructor () {
    this.dom = {
      $channelName: document.querySelector('#channel-name'),
      $createRoomBtn: document.querySelector('#create-room'),
      $status: document.querySelector('#status'),
      $audioDevice: document.querySelector('#audio-device'),
      $channelUid: document.querySelector('#uid'),
    };

    this.agora = new Agora(AGORA_MODE_RTC);

    this.onClickCreateRoom = this.onClickCreateRoom.bind(this);
    this.dom.$createRoomBtn.addEventListener('click', this.onClickCreateRoom);
  }

  async run() {
    const audioStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      // NOTE: 音声だけあれば十分だが、仕様的にvideoのトラックの参照も必要。
      video: true,
    });
    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length <= 0) {
      alert('オーディオが検出できませんでした。');
      return;
    }
    this.dom.$audioDevice.innerText = `接続デバイス：${audioTracks[0].label}`;
    this.agora.setAudio(audioTracks[0]);
    // const audioCtx = new AudioContext();
    // const source = audioCtx.createMediaStreamSource(audioStream);
    // source.connect(audioCtx.destination);
  }

  async onClickCreateRoom() {
    try {
      const channelName = this.dom.$channelName.value;
      if (!channelName || channelName.length <= 0) {
        alert('チャンネル名が入力されていません。');
        return;
      }

      const uid = await this.agora.joinChannel(channelName);
      await this.agora.publishAudio();

      this.dom.$status.classList.remove('status--failure');
      this.dom.$status.classList.add('status--success');
      this.dom.$status.innerText = '接続成功';
      this.dom.$channelUid.innerText = `UID: ${uid}`;
    } catch (e) {
      console.error(e);
      this.dom.$status.classList.add('status--failure');
      this.dom.$status.classList.remove('status--success');
      this.dom.$status.innerText = JSON.stringify(e);
    }
  }
}

window.addEventListener('load', () => {
  (new App()).run();
});
