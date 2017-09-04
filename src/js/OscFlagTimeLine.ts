import * as SVG from 'svg.js';
import * as $ from "jquery";
import OscFrag from './OscFlag'
import TimeLine from "./TimeLine";
export default class OscFragTimeLine
{
    public oscFrags:OscFrag[] = [];
    public isReadyDoubleClick:boolean = false;
    public timeline:TimeLine;
    public lineWidth:number;
    constructor(timeline:TimeLine,lineWidth:number)
    {
        this.timeline = timeline;
        this.lineWidth = lineWidth;
    }

    public addOsc =(button:number, mousePosOnTimeline:{x:number,y:number},framePerPixel:number,pixelPerFrame:number)=>
    {


        if(button == 0)
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
                    let f = new OscFrag(frag, mousePosOnTimeline, pixelPerFrame,framePerPixel);
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
                    let f = new OscFrag(frag, mousePosOnTimeline, pixelPerFrame,framePerPixel);
                    this.oscFrags.push(f);
                }

            }
            console.log(mousePosOnTimeline);

            this.isReadyDoubleClick = false;
        }

        if(button == 1)
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

    public addFlagByJSON =(data:any,framePerPixel,pixelPerFrame)=>
    {
        for(let i = 0; i < data.length; i++)
        {
            let frag = this.timeline.container.rect(0, this.timeline.height - this.lineWidth).move(data[i].x, this.lineWidth / 2).fill({color: "rgba(13, 71, 161,0.5)"}).stroke({
                color: '#0d47a1',
                opacity: 1.0,
                width: 0
            });
            console.log(frag);
            let f = new OscFrag(frag, data[i], pixelPerFrame,framePerPixel);
            this.oscFrags.push(f);
        }
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

    public exportJSON()
    {
        console.log("export start");
        let data = [];
        let i = 0;
        while(i < this.oscFrags.length)
        {
            console.log(this.oscFrags[i].mousePosOnTimeline);
            data.push(this.oscFrags[i].mousePosOnTimeline);
            i++;

            if(i == this.oscFrags.length)
            {
                var data = JSON.stringify(data);
                var a = document.createElement('a');
                a.textContent = 'export';
                a.download = 'fragValues.json';
                let blob = new Blob([data], { type: 'text/plain' });
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

                var exportLink = document.getElementById('export-link');
                exportLink.appendChild(a);
                console.log("export end");
            }

        }





    }
}