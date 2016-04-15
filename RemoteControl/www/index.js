function poll() {
    $.ajax({
        url: "finish.xml",
        type: "GET",
        async: false,
        cache: false,
        success: function(data) {
            $("#myButton").removeClass('ui-disabled'); 
	    $("#resultTableBody").empty();
            $(data).find("site").each(function () {
                var id = $(this).find("id").text();
                var bin = $(this).find("bin").text();
		$("#resultTableBody").append("<tr><th align=\"center\" valign=\"middle\">"+id+"</th><td align=\"center\" valign=\"middle\">"+bin+"</td></tr>");
            });
            $("#myButton").text("Run Test"); 
        },
        dataType: "xml",
        error: function() {setTimeout(function() {poll()}, 3000)},
        timeout: 2000
    })
};

function start() {
    $.ajax({
        url: "start.php",
        type: "POST",
        async: false,
        cache: false,
        data: '<?xml version="1.0" encoding="UTF-8"?><teradyne><command>start</command></teradyne>'
    })
};

$("#myButton").bind("click", function(event, ui) {
    $("#myButton").addClass('ui-disabled'); 
    $("#myButton").text("Waiting for Results"); 
    start();
    poll();
});
