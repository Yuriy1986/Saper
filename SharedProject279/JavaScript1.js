function Saper(row, col, w, h, level) {
    this.row = row;
    this.col = col;
    this.sumCell = this.row * this.col;
    this.w = w;
    this.h = h;
    //  1 level - 10% min, 2 level - 20% min, 3 level - 30% min.
    this.level = level;
    //  To determine the first step.
    this.firstStep = true;
    this.countFreeCell; 
    this.countStep = 0; 
    this.clock = 0;
    this.timerId;
    this.minesLeft; 

    this.startGame =
        function () {
            //  Create gamefield (15 - margin, 5 - between buttons).
            $("<div/>", { id: "canv" }).appendTo("body").css({
                "width": 30 + this.col * (this.w + 1) - 1,
                "height": 30 + this.row * (this.h + 1) - 1
            });

            if ($("#canv").width() >= innerWidth || $("#canv").height() >= innerHeight) {
                $("#canv").css({
                    "left": 0,
                    "top": 40
                });
            }
            else {
                $("#canv").css({
                    "left": innerWidth / 2 - $("#canv").width() / 2,
                    "top": innerHeight / 2 - $("#canv").height() / 2
                });
            }
            //  Click right button mouse.
            $("#canv").contextmenu(this.stubContextmenu); 

            //  Create buttons.
            for (var i = 0; i < this.row; i++) {
                for (var j = 0; j < this.col; j++) {
                    var temp = i * this.col + j + 1;

                    $("<button/>", { class: "but" }).appendTo("#canv").css({
                        "width": this.w,
                        "height": this.h,
                        "top": 15 + i * (this.h + 1),
                        "left": 15 + j * (this.w + 1)
                    }).attr("id", "el" + temp);

                    $("#el" + temp).click(this.step.bind(this, $("#el" + temp)));   //click left button mouse
                    $("#el" + temp).contextmenu(this.flag.bind(this, $("#el" + temp))); //click right button mouse
                }
            }
        };
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Saper.prototype.timer =
        function () {
            $("#time").text("Время: " + ++this.clock);
        };

    //  Stub right click mouse.
Saper.prototype.stubContextmenu =   
    function (event) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    };

Saper.prototype.step =
    function () {
        var idClick = parseInt(arguments[0].attr("id").substr(2), 10);

        if (this.firstStep) 
        {
            this.firstStep = false;
            //  Arrangement of mines.
            var mine = Math.round(this.sumCell * this.level / 10);
            this.minesLeft = mine;
            $("#mine").text(this.minesLeft);
            this.countFreeCell = this.sumCell - mine;

            for (var i = 0; i < mine;) {
                var temp = Math.round(Math.random() * (this.sumCell - 1) + 1);
                if (temp === idClick || $("#el" + temp).prop('mine'))
                    continue;
                $("#el" + temp).prop('mine', true);
                i++;
            }
            this.timerId = setInterval(this.timer.bind(this), 1000);
        }
        //  Check for loss.
        if ($("#el" + idClick).prop('mine'))    
        {
            this.loss(idClick);
            return;
        }

        if (this.count(idClick) !== 0)	
        {
            $("#el" + idClick).css({
                "background-color": "white"
            }).prop('step', true).text(this.count(idClick));
            $("#el" + idClick).off();
            $("#el" + idClick).contextmenu(this.stubContextmenu); 
            this.countStep++;
        }
        else
            this.wave(idClick); 

        //  Сheck for winnings.
        if (this.win()) {
            $("#canv").animate({
                opacity: '0.8'
            }, 100, handler);
        }

        function handler() {
            alert("Вы выиграли");
        }
    };

Saper.prototype.wave =  
    function (idClick) {

        for (var i = idClick - 1; i <= idClick + 1; i++) {
            if (i < 1 || i > this.sumCell || Math.ceil(i / this.col) !== Math.ceil(idClick / this.col))
                continue;

            for (var j = i - this.col; j <= i + this.col; j += this.col) {
                if (j < 1 || j > this.sumCell)
                    continue;
                if ($("#el" + j).prop('flag') || $("#el" + j).prop('mine') || $("#el" + j).prop('step'))
                    continue;
                $("#el" + j).css({
                    "background-color": "white"
                }).prop('step', true);
                $("#el" + j).off();  
                $("#el" + j).contextmenu(this.stubContextmenu); 

                this.countStep++;

                var temp = this.count(j);
                if (temp === 0)
                    this.wave(j);
                else {
                    $("#el" + j).text(temp);
                }
            }
        }
    };
    //  Count mines around the perimeter.
Saper.prototype.count =  
    function (idClick) {
        var countMines = 0;
        for (var i = idClick - 1; i <= idClick + 1; i++) {
            if (i < 1 || i > this.sumCell || Math.ceil(i / this.col) !== Math.ceil(idClick / this.col))
                continue;

            for (var j = i - this.col; j <= i + this.col; j += this.col) {
                if (j < 1 || j > this.sumCell)
                    continue;
                if ($("#el" + j).prop('mine'))
                    countMines++;
            }
        }
        return countMines;
    };

Saper.prototype.flag =  
    function () {
        if (this.firstStep)
            return;
        var idClick = parseInt(arguments[0].attr("id").substr(2), 10);  

        if ($("#el" + idClick).prop('flag')) {
            $("#mine").text(++this.minesLeft);

            $("#el" + idClick).css({
                "background-image": 'none'
            });
            $("#el" + idClick).click(this.step.bind(this, $("#el" + idClick)));   
            $("#el" + idClick).prop('flag', false);
        }
        else {
            $("#mine").text(--this.minesLeft);
            $("#el" + idClick).css({
                "background-image": 'url("Images/flag.jpg")',
                "background-size": "contain",
                "background-repeat": "no-repeat",
                "background-position": "center"
            });
            $("#el" + idClick).off("click");
            $("#el" + idClick).prop('flag', true);
        }
        this.stubContextmenu;
    };

Saper.prototype.loss =  
    function (idClick) {
        clearInterval(this.timerId);
        $("#mine").prop('disabled', true);
        $("#time").prop('disabled', true);

        for (var i = 1; i <= this.sumCell; i++) {
            $("#el" + i).off();
            if (i === idClick) {
                $("#el" + idClick).css({
                    "background-image": 'url("Images/fire(lose).gif")',
                    "background-size": "contain",
                    "background-repeat": "no-repeat",
                    "background-position": "center"
                });
                continue;
            }

            if ($("#el" + i).prop('flag') && $("#el" + i).prop('mine'))
                continue;

            if ($("#el" + i).prop('flag') && !$("#el" + i).prop('mine')) {
                $("#el" + i).css({
                    "background-image": 'url("Images/mineError.jpg")',
                    "background-size": "contain",
                    "background-repeat": "no-repeat",
                    "background-position": "center"
                });
                continue;
            }

            if ($("#el" + i).prop('mine')) {
                $("#el" + i).css({
                    "background-image": 'url("Images/mineBlack.jpg")',
                    "background-size": "contain",
                    "background-repeat": "no-repeat",
                    "background-position": "center"
                });
                continue;
            }
        }
    };

Saper.prototype.win =    
function () {
    if (this.countStep !== this.countFreeCell)
        return false;
    else {
        clearInterval(this.timerId);
        $("#mine").prop('disabled', true);
        $("#time").prop('disabled', true);
        $("#mine").text(0);

        for (var i = 1; i <= this.sumCell; i++) {
            $("#el" + i).off();
            if ($("#el" + i).prop('mine') && !$("#el" + i).prop('step') && !$("#el" + i).prop('flag'))
                $("#el" + i).css({
                    "background-image": 'url("Images/mineBlack.jpg")',
                    "background-size": "contain",
                    "background-repeat": "no-repeat",
                    "background-position": "center"
                });
        }
        return true;
    }
};