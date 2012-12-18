metricHistory = (json) ->
	historydiv = d3.select("#history")

	console.log "JSAWN", json

	svgs = historydiv.selectAll("svg")
		.data(_.keys(json))
		.enter()
		.append("svg").attr("width", 700).attr("height", 100)

	svgs.attr("id", (d,i) -> d )

	timescale = {}
	_.each(json, (d) ->
		x = d3.time.scale()
    	.domain([new Date(data[data.length - 1].date), new Date(data[0].date)])
    	.rangeRound([0, width]);
		console.log "deeDAdee", d


	)

	svgs.selectAll("rect")
		.data((d) -> json[d])
		.enter()
		.append("rect")
		.attr("height", (d,i) ->
			metric = _.keys(d)[1]
			console.log "RECT D", d, metric

			d[metric]
		)
		.attr({
			"width": 20,
			"x": (d,i) ->
				i*21
		})

	#history.selectA

	#history.append("svg:rect").attr("width", 500).attr("height",500).attr("fill", "black")

$.ajax({
  url: "/metric-history?user=user2"
  cache: false
}).done((json) ->
	metricSeperate = []
	seperateOutMetric = (metricName) ->
		metric = metricName
		metricSeperate[metric] = []

		_.each(json, (el, i) ->
			newrow = {"date": el.date}
			newrow[metric] = el[metric];

			metricSeperate[metric].push(newrow)
		)

	metrics = _.keys(json[0])
	_.each(metrics, (metric) ->
		seperateOutMetric(metric)
	)

	console.log "MS=>", metricSeperate
	#$('#history').text(JSON.stringify(json))

	metricHistory metricSeperate

)
