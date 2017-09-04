import * as SVG from 'svg.js';
import * as $ from "jquery";
export default class OscFlag
{
    public frag:SVG.Rect;
    public values:any = {name:"value"};
    public isSelected:boolean = false;
    public sendingOscTime:number = 120;
    public time:number = 0;
    public width:number = 4;
    public pixelPerFrame:number = 0.1;


    constructor(frag:SVG.Rect, time:number, pixelPerFrame:number)
    {
        this.frag = frag;
        this.time = time;
        this.pixelPerFrame = pixelPerFrame;
        this.width = this.sendingOscTime * this.pixelPerFrame;
        this.frag.width(this.width);

    }

    public select =()=>
    {

        console.log(this.frag.id());
        this.isSelected = true;
        this.frag.stroke({
            color: '#0d47a1',
            opacity: 1.0,
            width: 2
        });

        $(".inputFlagValue").val(JSON.stringify(this.values));
        $("#sendingFrames").val(this.sendingOscTime);



    }

    public diselect =()=>
    {
        this.isSelected = false;
        this.frag.stroke({opacity:0.0});


    }

    public setInputValues()
    {

        this.values = JSON.parse( $(".inputFlagValue").val());
        this.sendingOscTime = Number($("#sendingFrames").val());
        this.width = this.sendingOscTime * this.pixelPerFrame;
        this.frag.width(this.width);

    }
}