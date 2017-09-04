import * as SVG from 'svg.js';
import * as $ from "jquery";
export default class TimeLine
{
    public container:SVG.Container;
    public width :number = 0;
    public height :number = 0;
    constructor(width:number,height:number)
    {
        this.width = width;
        this.height = height;
        this.container = SVG('timeline').size(width,height);
    }
}