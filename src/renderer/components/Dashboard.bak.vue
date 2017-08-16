<template>
<div class="dashboard">
  <h3 class="text-center">Welcome to Robinhood-Web</h3>
  <div class="small" v-if="dayLineGraphData">
    <line-chart :chart-data="dayLineGraphData" :options="chartOptions"></line-chart>
  </div>
</div>
</template>
<script>
import state from '@/state';
import LineChart from '@/components/Graphs/LineChart';
import moment from 'moment';

/*
# get_history :AAPL, "5minute", {span: "day"}
# get_history :AAPL, "10minute", {span: "week"}
# get_history :AAPL, "day", {span: "year"}
# get_history :AAPL, "week", {span: "5year"}
5minute / span day
10minute / span week
day / span year
week / span 5year
*/

export default {
  created() {   //Requests historical data from Robinhood for the following attributes
    this.updateChartData();
  },
  data() {  //Initializes ChartOptions as null
    return {
      chartOptions: null,
      updateTimer: setTimeout(function(){}, 0)
    }
  },
  computed: {
    account() {  // Gets accountID of current user
      return state.getters['robinhood/currentAccount'];
    },
    robinhoodUser() {  // Gets current user's Username
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio() { //Gets current user's portfolio
      return state.getters['robinhood/resource'](this.account.portfolio);
    }
  },
  methods: {
    updateChartData(){
      this.updateTimer = setTimeout(() => {
        console.log("Updating chart data...");

        state.dispatch('robinhood/getHistoricals', {
          account_number: this.account.account_number,
          interval: '5minute',
          span: 'day'
        });

        this.updateChartData();
      }, 5000);
    },
    getLineGraphData(data) {
      let lineGraphData = [];
      let equityData = [];
      let netWorthData = [];
      let equityLabelData = [];

      data.forEach(function(item){
        equityData.push(parseFloat(item.adjusted_open_equity));
        equityLabelData.push(moment(item.begins_at).format("LT"));
        netWorthData.push(parseFloat(item.net_return));
      });

      this.chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: '#FFFFFF'
          }
        },
        scales: {

          yAxes: [{
            id: 'first-y-axis',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Equity ($)',
              fontColor: "#FFFFFF",
            },
            gridLines: {
              color: "#FFFFFF",
              lineWidth: 2,
            },
            ticks: {
              beginAtZero: false,
              fontColor: '#FFFFFF',
            }
          },
            {
              id: 'second-y-axis',
              position: 'right',
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Net Worth ($)',
                fontColor: "#FFFFFF",
              },
              gridLines: {
                color: "#FFFFFF",
                lineWidth: 2,
                display: false,
              },
              ticks: {
                beginAtZero: false,
                fontColor: '#FFFFFF',
              }

            }],
          xAxes: [{
            display: true,
            gridLines: {
              color: "#FFFFFF",
              lineWidth: 2,
            },
            ticks: {
              fontColor: '#FFFFFF'
            }
          }]
        }
      }

      lineGraphData.push({
        label: 'Equity',
        yAxisID: 'first-y-axis',
        fill: false,
        pointRadius: 0,
        borderColor: '#00CC99',
        lineTension: .05,
        data: equityData
      },
        {
          label: 'NetWorth',
          yAxisID: 'second-y-axis',
          fill: false,
          pointRadius: 0,
          borderColor: '#339999',
          lineTension: .05,
          data: netWorthData
        });


      return {
        labels: equityLabelData,
        datasets: lineGraphData
      }
    }
  },
  watch: {

  },
  components: {
    'line-chart': LineChart
  },
  beforeDestroy(){
    clearTimeout(this.updateTimer);
  }
}
</script>


<style>
  .small {
    margin:  0px auto;
    background-color: #333333;
     }
</style>
