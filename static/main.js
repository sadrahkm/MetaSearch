$(document).ready(function () {
    let results = [];
    $("#searchButton").on('click', function (event) {
        event.preventDefault();
        let phrase = $("#searchInput").val();
        let res = axios.get(`/?search=${phrase}`).then(
            response => {
                $(".search-result").remove();
                $("#resultContainer").css("display", "block");
                console.log(response);
                results = response.data;
                results.forEach((item) => {
                    if (item)
                        $('#resultContainer').append(`
                         <article class="search-result row border border-primary rounded">
                              <div class="col-md-2">
                                <ul class="meta-search">
                                  <p class="ranking">Ranking: ${item.rank ? item.rank : ""}</p>
                                  <p class="engine">From: ${item.engine ? item.engine : ""}</p>
                                </ul>
                              </div>
                              <div class="col-md-10 excerpet">
                              <a href="${item.link ? item.link : ""}">
                                <h3 class="title">${item.title ? item.title : ""}</h3>
                                </a>
                                <p class="description">${item.description ? item.description : ""}</p>
                              </div>
                            </article>
                         `);
                });
            })
            .catch(error => {
                console.log(error);
            })
    })
});