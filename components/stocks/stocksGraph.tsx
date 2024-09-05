import ReactECharts from 'echarts-for-react';

type StocksGraphProps = {
    data: number[][]

}

export function StocksGraph(props: StocksGraphProps) {
    let xs = props.data.map(d => d[0]) as number[]
    let maxX = Math.max(50, props.data.length * 1.5);
    let minX = 0;

    const options = {
        grid: { top: 8, right: 8, bottom: 24, left: 36 },
        xAxis: {
            type: 'value',
            scale: true,
            name: "Seconds",
            min: minX, 
            max: maxX,
            axisLine: {
                show: false, // Hide full Line
            },
            axisTick: {
                show: false, // Hide Ticks,
            },
            boundaryGap: true,
        },
        yAxis: {
            boundaryGap: true,
            type: 'value',
            scale: true,
            
        },
        series: [
          {
            data: props.data ?? [],
            type: 'line',
            smooth: false,
            symbol: 'none',
          },
        ],
        tooltip: {
          trigger: 'axis',
        },
      };
    
    return <ReactECharts option={options} />;
    // return <div>
    //     <p>Graph</p>
    // </div>
}