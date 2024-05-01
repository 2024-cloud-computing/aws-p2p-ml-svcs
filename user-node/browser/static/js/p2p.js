$(function () {
 
    $("#img-gen-btn").click(function () {
        var jsonData;
        if ($("#imgInput").val() == null || $("#imgInput").val() == "") {
            jsonData = {
                "imgInput": ""
            };
        } else {
            jsonData = {
                "imgInput": $("#imgInput").val()
            };
        }
        
        $.ajax({
            type: "GET",
            url: document.location.protocol + "//" + document.location.hostname + ":8080/imggen",
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            data: jsonData,
            success: function (res) {
                updateGenImg(res);
            }
        });
        
        $("#imgInput").val("");
        return false;
    })

    $("#txt-gen-btn").click(function () {
        var jsonData;
        if ($("#txtInput").val() == null || $("#txtInput").val() == "") {
            jsonData = {
                "txtInput": ""
            };
        } else {
            jsonData = {
                "txtInput": $("#txtInput").val()
            };
        }
        $.ajax({
            type: "GET",
            url: document.location.protocol + "//" + document.location.hostname + ":8080/txtgen",
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            data: jsonData,
            success: function (res) {
                updatetxtResult(res);
            }
        });
        
        $("#txtInput").val("");
        return false;
    })

    function updatetxtResult(res) {
        $('#txtResult').val("");
        textItems = res['data'];
        var items = [];
        items.push(
            `<table>
                        <thead>
                            <tr>
                                <td>Input</td>
                                <td>Label</td>
                                <td>Confidence</td>
                            </tr>
                        </thead>
                        <tbody>`
        );
        for (var i in textItems) {
            var item = textItems[i];
            items.push(`<tr id ="` + item._id + `">
                                <td name="Input">` + item.Input + `</td>
                                <td name="Label">` + item.Label + `</td>
                                <td name="Confidence">` + item.Score + `</td>
                            </tr>`);
        }
        $('#txtResult').html(items.join(''));
    }

    function updateGenImg(res) {
        $('#imgResult').val("");
        imgItems = res['data'];
        var items = [];
        items.push(
            `<table>
                        <thead>
                            <tr>
                                <td>Generated Images</td>
                            </tr>
                        </thead>
                        <tbody>`
        );
        for (var i in imgItems) {
            var item = imgItems[i];
            items.push(`<tr id ="` + item._id + `">
                                <td><img src="` + item.Image + `" width="100" height="100"></td>
                            </tr>`);
        }
        $('#imgResult').html(items.join(''));
    }
})