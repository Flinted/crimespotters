var PieChart = function(crimeTypes){

  var container = document.getElementById("pieChart");

  var chart = new Highcharts.Chart({
    chart: {
      type: "pie",
      renderTo: container
    },

    title: {
      text: "Crimes by type within target area"
    },

    series: [
      {
        name: "Type",
        data: crimeTypes
      }
    ]

  })
    console.log(chart)

}