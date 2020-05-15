import { Element, Component, Host, Prop, h } from '@stencil/core';
import { select } from 'd3-selection';
import { pie, arc } from 'd3-shape';

import { scaleOrdinal } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateCool } from 'd3-scale-chromatic';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Element() element: HTMLElement;
  @Prop() width: number = 400;
  @Prop() height: number = 400;
  @Prop() data: string = "[]";

  public chartData: any;

  constructor(){
    this.chartData = JSON.parse(this.data)
  }

  componentDidLoad(){
    let svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
      .attr("width", this.width)
      .attr("height", this.height);
    this.buildChart(svg);
  }

  buildChart(svg){

    let radius = Math.min(this.width, this.height) / 2;
    let arcShape = arc().innerRadius(radius*0.4).outerRadius(radius-1);
    let arcShapeLabels = arc()
      .outerRadius(radius-1)
      .innerRadius(radius*0.7);

    let colorScale = scaleOrdinal()
      .domain(this.chartData.map(d => d.tag))
      .range(quantize(t => interpolateCool(t * 0.8 + 0.1), this.chartData.length).reverse());

    let pieDataStructure = pie().sort(null).value(d=>d.value)(this.chartData);
    
    svg.append("g")
      .attr("transform", `translate(${this.width/2}, ${this.height/2})`)
      .attr("stroke", "white")
      .selectAll("path")
      .data(pieDataStructure)
      .join("path")
        .attr("fill", d => colorScale(d.data.tag))
        .attr("d", arcShape)
      .on('mouseenter', function () {
        select(this).attr('class', select(this).classed("selected") ? null : "selected")
      })
      .on('mouseleave', function () {
        select(this).attr('class', select(this).classed("selected") ? null : "selected")
      })
  
    svg.append("g")
        .attr("transform", `translate(${this.width/2}, ${this.height/2})`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .attr("font-weight", 800)
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(pieDataStructure)
      .join("text")
        .attr("transform", d => 
          `translate(${arcShapeLabels.centroid(d)[0]*0.8},${arcShapeLabels.centroid(d)[1]*0.8})`
        )
        .call(text => text.append("tspan")
            .text(d => d.data.tag));
  }

  render() {
    return  (
      <Host>
        <svg class="chart"/>
      </Host>
    )
  }
}
