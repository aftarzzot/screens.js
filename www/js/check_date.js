function checkDateEntrance(date, period) {
	var periods = period.split(',');
	return (date >= new Date(periods[0]) && date <= new Date(periods[1]));
}
if (checkDateEntrance(new Date(), '2017-08-01,2017-09-01')) {

	alert('true!');
}
