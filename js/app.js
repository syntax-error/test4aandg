/*global $ */
$(function onPageLoad() {
    "use strict";
    /*
     * Easy access to all important elements
     */
    const els = {
        input: $("#searchbar input"),
        results: $("#results"),
        pagination: {
            next: $("#next"),
            prev: $("#prev"),
            current: $("#cur-page"),
            total: $("#total-pages")
        },
        loading: $(`<div class="loading">Loading...</div>`)
    };
    /*
     * HN has an hourly query limit, so don't start searching until at least this many characters
     * to save queries
     */
    const searchCharThreshold = 2;
    /*
     * HN has an hourly query limit, so don't start searching until at least this many milliseconds
     * after final input, to save queries
     */
    const searchDelay = 1000;
    const queryUrl = "http://hn.algolia.com/api/v1/search";
    let curQuery = "";
    let delayedQueryFn;
    let curPage = 1;
    let totalPage = 1;

    function setNavBtnDisabled(element, disabled) {
        if (disabled) {
            element.addClass("disabled");
        } else {
            element.removeClass("disabled");
        }
    }

    function processResponse(response) {
        els.results.empty();
        response.hits.forEach(function populateResult(hit) {
            const resultEl = $(`
                <a href="${hit.url}" class="result">
                    <div class="title">${hit.title}</div>
                </div>
            `);
            els.results.append(resultEl);
        });

        // Set Page Data
        totalPage = response.nbPages;
        const noPages = totalPage === 0;
        if (noPages) {
            curPage = 0;
        }
        els.pagination.current.text(curPage);
        els.pagination.total.text(totalPage);
        setNavBtnDisabled(els.pagination.next, curPage >= totalPage);
        setNavBtnDisabled(els.pagination.prev, curPage <= 1);
        if (noPages) {
            els.results.append(`
                <div class="no-results">No results returned for your query</div>
            `);
        }
    }

    function doQuery() {
        const params = {
            tags: "story",
            page: curPage - 1,
            query: curQuery
        };
        $.getJSON(queryUrl, params, processResponse);
        els.results.append(els.loading);
        setNavBtnDisabled(els.pagination.next, true);
        setNavBtnDisabled(els.pagination.prev, true);
    }

    els.input.on("keyup", function onInputChange() {
        let query = els.input.val().trim();
        if (curQuery !== query && query.length >= searchCharThreshold) {
            clearTimeout(delayedQueryFn);
            curPage = 1;
            delayedQueryFn = setTimeout(doQuery, searchDelay);
            curQuery = query;
        }
    });

    els.input.on("blur", function onInputBlur() {
        els.input.val(curQuery);
    });

    els.pagination.next.on("click", function onNextClick() {
        curPage = Math.min(curPage + 1, totalPage);
        doQuery();
    });

    els.pagination.prev.on("click", function onNextClick() {
        curPage = Math.max(curPage - 1, 1);
        doQuery();
    });
});