import * as SVG from 'svg.js';
import * as $ from "jquery";
import OscFlag from './OscFlag'
import TimeLine from "./TimeLine";
export default class OscFragTimeLine
{
    public oscFrags:OscFlag[] = [];
    public isReadyDoubleClick:boolean = false;
    public timeline:TimeLine;
    public lineWidth:number;
    constructor(timeline:TimeLine,lineWidth:number)
    {
        this.timeline = timeline;
        this.lineWidth = lineWidth;
    }

    public addOsc =(evt:MouseEvent, mousePosOnTimeline:{x:number,y:number},framePerPixel:number,pixelPerFrame:number)=>
    {
        console.log("onMouseUp");
        console.log(evt);

        if(evt.button == 0)
        {

            let selectNum = 0;

            if(this.oscFrags.length > 0 )
            {

                let isCheck = false;
                for(let i = 0; i < this.oscFrags.length; i++) {
                    if(this.oscFrags[i].isSelected)
                    {
                        this.oscFrags[i].setInputValues();
                    }
                    this.oscFrags[i].diselect();
                    if (this.oscFrags[i].frag.x() + this.oscFrags[i].width > mousePosOnTimeline.x && this.oscFrags[i].frag.x() <= mousePosOnTimeline.x)
                    {

                        console.log("flag select")
                        isCheck = true;
                        this.oscFrags[i].select();
                        selectNum ++;
                        $(".inputFlagValue").addClass("edit");
                        $("#sendingFrames").addClass("edit");

                    }


                }

                if(!isCheck && this.isReadyDoubleClick)
                {
                    let frag = this.timeline.container.rect(0, this.timeline.height - this.lineWidth).move(mousePosOnTimeline.x, this.lineWidth / 2).fill({color: "rgba(13, 71, 161,0.5)"}).stroke({
                        color: '#0d47a1',
                        opacity: 1.0,
                        width: 0
                    });

                    console.log(frag);
                    let f = new OscFlag(frag, mousePosOnTimeline.x * framePerPixel, pixelPerFrame);
                    this.oscFrags.push(f);
                }

                if(selectNum == 0)
                {
                    $(".inputFlagValue").removeClass("edit");
                    $('#sendingFrames').removeClass("edit");
                    $(".inputFlagValue").val("");
                    $('#sendingFrames').val("");
                }
            } else
            {
                if(this.isReadyDoubleClick) {

                    let frag = this.timeline.container.rect(0, this.timeline.height - this.lineWidth).move(mousePosOnTimeline.x, this.lineWidth / 2).fill({color: "rgba(13, 71, 161,0.5)"}).stroke({
                        color: '#0d47a1',
                        opacity: 1.0,
                        width: 0
                    });
                    console.log(frag);
                    let f = new OscFlag(frag, mousePosOnTimeline.x * framePerPixel, pixelPerFrame);
                    this.oscFrags.push(f);
                }

            }

            this.isReadyDoubleClick = false;
        }

        if(evt.button == 1)
        {
            for(let i = 0; i < this.oscFrags.length; i++)
            {
                if(this.oscFrags[i].frag.x()+this.oscFrags[i].width > mousePosOnTimeline.x && this.oscFrags[i].frag.x() <= mousePosOnTimeline.x)
                {
                    this.oscFrags[i].frag.remove();
                    this.oscFrags.splice(i,1);
                }
            }
        }


        // シングルクリックを受理、300ms間だけダブルクリック判定を残す
        this.isReadyDoubleClick = true;
        setTimeout( ()=> {
            // ダブルクリックによりclickedフラグがリセットされていない
            //     -> シングルクリックだった
            if (this.isReadyDoubleClick) {
                // alert("single click!");
            }

            this.isReadyDoubleClick = false;
        }, 300);

    }

    public update(playingTime:number,dTime:number)
    {
        let oscNum = 0;
        for(let i = 0; i < this.oscFrags.length; i++)
        {
            let fragtime = this.oscFrags[i].time;
            let fragtime_floored = Math.floor(fragtime);
            let frameNum = fragtime - fragtime_floored;
            if((playingTime+dTime)*60 > fragtime && (playingTime+dTime)*60 < fragtime+this.oscFrags[i].sendingOscTime )
            {
                $(".flagValueDebug").text(JSON.stringify(this.oscFrags[i].values));
                oscNum++;
            }
        }

        if(oscNum == 0)
        {
            $(".flagValueDebug").text("");
        }

    }
}