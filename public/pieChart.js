var PieChart = function(crimeTypes){

  var container = document.getElementById("pieChart");

  var chart = new Highcharts.Chart({
    chart: {
      type: "pie",
      renderTo: container,
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      style: {
       fontFamily: 'Mononoki'
     }
   },
   plotOptions: {
    series: {
      dataLabels: {
        enabled: false
      },
      showInLegend: true,
    }
    },
     legend: {
      align: 'left',
      verticalAlign: 'bottom',
      layout: 'vertical',
    },
   title: {
    text: "Crimes by type within target area"
  },
  credits: [
  {
    enabled:false
  }
  ],
  series: [
  {
    name: "Type",
    data: crimeTypes,
    borderColor: "black",
    borderWidth: 1
  }
  ]

})

}