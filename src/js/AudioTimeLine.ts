export  default class AudioTimeLine {

    public audioSouce:AudioBufferSourceNode;
    public audioContext:AudioContext;
    public audioBuffer:ArrayBuffer;
    public audioGainNode:any;
    public replayTime:number;
    public startTime:number;
    public pausingTime:number;
    public isPause:boolean = false;
    constructor(audioBuffer:ArrayBuffer,successCallback,errorCallback)
    {
        this.audioContext = new AudioContext();
        this.audioContext.decodeAudioData(audioBuffer, successCallback, errorCallback);
        this.audioBuffer = audioBuffer;
    }

    public play =()=>
    {
        //AudioBufferSourceNodeを作成する
        this.audioSouce = this.audioContext.createBufferSource();
        //bufferプロパティにAudioBufferインスタンスを設定
        this.audioSouce.buffer = this.audioBuffer;
        //ループ
        this.audioSouce.loop = false;
        //AudioBufferSourceNodeインスタンスをdestinationプロパティに接続
        this.audioSouce.connect(this.audioContext.destination);

        //GainNodeを作成する
        this.audioGainNode = this.audioContext.createGain();
        //sourceをGainNodeへ接続する
        this.audioSouce.connect(this.audioGainNode);
        //GainNodeをAudioDestinationNodeに接続
        this.audioGainNode.connect(this.audioContext.destination);
        // this.audioGainNode.gain.value = -0.4;


        this.setVolume();
        // this.updateStartTime = new Date().getTime();


        //replayTimeからstartTimeとpausingTime引いた時間が曲のスタート時間
        var playTime = this.replayTime - this.startTime - this.pausingTime;

        //再生
        this.audioSouce.start(0, 0);
    }

    public setVolume()
    {
        var value = document.getElementById( "volume" ).value / 100.0;
        this.audioGainNode.gain.value = value;
    }

    public pause =()=>
    {
        this.audioSouce.stop(0);
        this.isPause = true;

    }
}