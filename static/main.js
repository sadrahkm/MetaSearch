let results = [];
$(document).ready(function () {
    $("#searchButton").on('click', function () {
        let res = await axios.get('').then(
            response => {
                console.log(response);
                results = response.data;
                for (var i = 0; i < results.length; i++) {
                    $("#engine").text(results[i].engine);
                    $("#title").text(results[i].title);
                    $("#ranking").text(results[i].ranking);
                    $("#link").text(results[i].link);
                    $("#description").text(results[i].description);
                }
            })
            .catch(error => {
                console.log(error);
            })
    })
});