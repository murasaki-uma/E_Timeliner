export  default class AudioTimeLine {

    public audioSouce:AudioBufferSourceNode;
    public audioContext:AudioContext;
    public audioBuffer:AudioBuffer;
    public audioGainNode:any;
    public replayTime:number;
    public startTime:number;
    public  pausingTime:number;
    constructor(audioBuffer:ArrayBuffer)
    {
        this.audioContext = new AudioContext();
        this.audioBuffer = audioBuffer;
    }

    public play()
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
        this.audioSouce.start(0, playTime);
    }

    public setVolume()
    {

    }
}