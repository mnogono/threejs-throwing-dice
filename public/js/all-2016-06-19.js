var PLAYFIELD_DIR = ''; /*для макета = ''*/

//Функция для логирования элементов
var getElementName = function (domElement) {
    var name = domElement.tagName.toUpperCase();
    var $domElement = $(domElement);
    name += $domElement.attr('id') ? "[#"+$domElement.attr('id')+"]" : "";
    name += $domElement.attr('class') ? "[."+$domElement.attr('class')+"]" : "";
    return name;
};

//Плагин zoomLayer, для масштабирования игрового поля
(function($) {
    var counter = 0;

    $.fn.zoomLayer = function(zoomLevel, debug) {
        if (debug) {
            console.log("Запуск №"+ ++counter);
            console.log("текущий зум: "+zoomLevel);
        }

        return this.each(function(index){
            var $self = $(this);
            var elementName = getElementName(this);

            debug = $self.data("debug") ? true : false;

            var elemWidth = parseInt($self.css('max-width'));
            var elemHeight = parseInt($self.css('max-height'));

            //если не заданы линейные размеры в max-width и max-height, то не делаем преобразований
            if (!isNaN(elemWidth) && !isNaN(elemHeight)) {
                //преобразование линейных размеров
                $self.width(elemWidth/zoomLevel);
                $self.height(elemHeight/zoomLevel);

                if (debug) {
                    console.log("Линейные размеры "+elementName);
                    console.log("width: " + elemWidth + " \u2192 " + elemWidth/zoomLevel + " \u2192 " + $self.width());
                    console.log("height: " + elemHeight + " \u2192 " + elemHeight/zoomLevel + " \u2192 " + $self.height());
                }

                //преобразование координат относительно контейнера
                //сохранение исходных значений, если data-nomove="true"
                var nomove = $self.data('nomove');

                if (!nomove) {
                    var isChangedCoords = false;
                    var coords = ['left', 'top', 'right', 'bottom'];
                    coords.forEach(function (item) {
                        var elemCoord = $self.data('initial-' + item);
                        if (!elemCoord) {
                            elemCoord = parseFloat($self.css(item));
                            if (!isNaN(elemCoord) && (elemCoord >= 1 || elemCoord <= -1)) {
                                $self.data('initial-' + item, elemCoord);
                            }
                        }
                        if (!isNaN(elemCoord) && (elemCoord >= 1 || elemCoord <= -1)) {
                            $self.css(item, elemCoord/zoomLevel + "px");

                            if (debug) {
                                if (!isChangedCoords) {
                                    console.log("Координаты "+elementName);
                                    isChangedCoords = true;
                                }
                                console.log(item+": " + elemCoord + " \u2192 " + elemCoord/zoomLevel + " \u2192 " + $self.css(item));
                            }
                        }
                    });
                } else {
                    if (debug) {
                        console.log('Для элемента ' + elementName + ' запрещены преобразования координат');
                    }
                }
            } else {
                if (debug) {
                    console.log('Для элемента ' + elementName + ' не заданы min-width или min-height');
                    $(this).data('resize-error', index);
                }
            }

            //Для inline-элементов SPAN преобразуем шрифт
            if ($self.get(0).tagName == "SPAN") {
                var $parent = $self.parent();

                $self.css({
                    'font-size': 1/zoomLevel*100 + "%",
                    'line-height': $parent.height() + "px",
                    'letter-spacing': 1/zoomLevel*100 + "%"
                });
            }
        });
    }
})(jQuery);

/***********************************************************/
/*Предзагрузка изображений                                 */
/***********************************************************/
var preloadImages = function(images, callback) {
    var images_count = images.length;
    var loaded_count = 0;
    $.each(images, function(index, src) {
        var image = $('<img src="' + PLAYFIELD_DIR + src + '">');
        image.load(function() {
            loaded_count++;
            if (loaded_count == images_count && callback) {
                callback();
            }
        });
    });
};

$.ajax({
    type : 'GET',
    url : PLAYFIELD_DIR + 'images.json',
    cache : false,
    //async : false,
    dataType: 'json',
    data: {  },

    beforeSend: function() {

    },

    success : function(data, status){
        var imagesArr = data['images'];

        preloadImages(imagesArr, function() {
            console.log('Предзагрузка завершена');
        });
    },

    error: function(data, status, error) {
        console.log(status + " : " + error);
    }
});

/***********************************************************/
/*Обработчик события загрузки документа                    */
/***********************************************************/
$(document).ready(function() {

/***********************************************************/
/*Расстановка игровых карточек внутри поля                 */
/***********************************************************/
    //начальная позиция для карточек игрового поля в пикселях (по макету)
    var RENDER_START_TOP_POS = 10;
    var RENDER_START_LEFT_POS = 11;

    var renderPlayField = function (show_grid) {
        var $playDesc = $('#play-desc > DIV');

        //расположение элементов
        $playDesc.each(function(num) {
            var $self = $(this);

            //линейные размеры элемента
            var elemWidth = parseInt($self.css('max-width')) || 0;
            var elemHeight = parseInt($self.css('max-height')) || 0;

            //отступ текущей иконки от предыдущей
            var elemLeft = parseInt($self.data('left')) || 0;
            var elemTop = parseInt($self.data('top')) || 0;
            var elemRight = parseInt($self.data('right')) || 0;
            var elemBottom = parseInt($self.data('bottom')) || 0;

            var owned = $self.hasClass("owned") ? "_owned" : "";

            renderPlayField.leftPos += elemLeft;
            renderPlayField.leftPos -= elemRight;
            renderPlayField.topPos += elemTop;
            renderPlayField.topPos -= elemBottom;

            if ($self.hasClass("bottom")) {
                renderPlayField.leftPos -= elemWidth;
            }

            if ($self.hasClass("left")) {
                renderPlayField.topPos -= elemHeight;
            }

            $self.css({
                'top' : renderPlayField.topPos + "px",
                'left' : renderPlayField.leftPos + "px"
            });

            $self.find('.icon').css({
                'background-image': 'url(' + PLAYFIELD_DIR + 'images/play_field_icons/icon_' + num + owned + '.png)'
            });

            if (show_grid) {
                $self.css({
                    'background-color' : 'rgba(31, 0, 220, 0.2)'
                });
            }

            if ($self.hasClass("top")) {
                renderPlayField.leftPos += elemWidth;
            }

            if ($self.hasClass("right")) {
                renderPlayField.topPos += elemHeight;
            }

            //прочие установки
            $self.attr('id', 'pf-'+renderPlayField.id);
            renderPlayField.id++;

            /*$self.css({
                'font' : 'bold 15px Arial',
                'color': '#000',
                'line-height': '20px'
            }).prepend('<em>'+num+'</em>');*/

        });

        //обработчики событий
        $playDesc.click(function() {
            var $self = $(this);
            //инфо по карточке товара
            if ($self.hasClass('buyable')) {
                var assetId = $self.attr('id').replace('pf-', '');

                $('#play-chat').hide();
                $('#play-content > DIV').hide();
                $('#asset-info').find('.asset_icon').removeClass().addClass('asset_icon icon_asset'+assetId);
                $('#asset-info').show();
                $('#play-content').show();
            }
        });
    };

    //id первой карточки
    renderPlayField.id = 0;

    //позиция первой карточки
    renderPlayField.topPos = RENDER_START_TOP_POS;
    renderPlayField.leftPos = RENDER_START_LEFT_POS;

    renderPlayField();

/***********************************************************/
/*Масштабирование поля                                     */
/***********************************************************/
    //поле
    var $playSpaceWrapper = $('#play-space-wrapper');

    //стороны поля - оригинал
    var maxWidth = parseInt($playSpaceWrapper.css('max-width'));
    var maxHeight = parseInt($playSpaceWrapper.css('max-height'));

    //стороны поля - текущие
    var currentWidth = $playSpaceWrapper.width();
    var currentHeight = $playSpaceWrapper.height();

    var playFieldZoom = Math.max(maxHeight/currentHeight, maxWidth/currentWidth);

    var $playSpace = $playSpaceWrapper.find('*');

    $playSpace.zoomLayer(playFieldZoom, true);

    //послеигровая статистика
    var $playStats = $('#play-stats');
    var $playStatsTable = $playStats.find('*');

    $playStatsTable.zoomLayer(playFieldZoom, true);

    /*профайлер*/
    /*var starttime = (new Date()).getMilliseconds();
    var endtime = (new Date()).getMilliseconds();
    console.log(endtime-starttime);*/

/***********************************************************/
/*Скроллбары                                               */
/***********************************************************/
    //общие настройки
    $.mCustomScrollbar.defaults.scrollButtons.enable=true;

    //подключение
    $('.scroll_window').mCustomScrollbar({
        theme: "light-2",
        alwaysShowScrollbar: 0
    });

    //дополнительные контейнеры для ползунка
    $('.mCSB_dragger_bar').html('<div class="slider1"><div class="slider2"><div class="slider3"></div></div></div>');

    //масштабирование полос прокрутки и ползунков
    var zoomScrollBars = function (zoomLevel) {
        var scrollBarParams = {
            'mCSB_scrollTools': ['width'],
            'mCSB_buttonUp': ['height'],
            'mCSB_draggerContainer': ['margin-top', 'margin-bottom'],
            'mCSB_buttonDown': ['height'],
            'slider1': ['padding-top'],
            'slider2': ['padding-bottom']
        };

        $.each(scrollBarParams, function (className, cssParams) {
            var $self = $('.' + className);

            cssParams.forEach(function (item) {
                var cssParam = $self.data('initial-' + item);

                if (!cssParam && $self.css(item).indexOf("px") > -1) {
                    cssParam = parseFloat($self.css(item));
                    if (!isNaN(cssParam) && (cssParam >= 1 || cssParam <= -1)) {
                        $self.data('initial-' + item, cssParam);
                    }
                }
                if (!isNaN(cssParam) && (cssParam >= 1 || cssParam <= -1)) {
                    $self.css(item, cssParam / zoomLevel + "px");
                }
            });
        });
    };

    zoomScrollBars(playFieldZoom);

/***********************************************************/
/*Обработчики событий                                      */
/***********************************************************/

    //модификация игрового поля в зависимости от изменения размеров окна браузера
    $(window).resize(function(){
        currentWidth = $playSpaceWrapper.width();
        currentHeight = $playSpaceWrapper.height();

        playFieldZoom = Math.max(maxHeight/currentHeight, maxWidth/currentWidth);

        $playSpace.zoomLayer(playFieldZoom, true);
        zoomScrollBars(playFieldZoom);

        $playStatsTable.zoomLayer(playFieldZoom, true);
    });

    //выпадающий список на вкладке "Обмен"
    $(document).on('click', function(event) {
        if ($(event.target).closest('.offer_selector').length) return;
        $('.offer_list').hide();
    });

    $('.offer_selector').click(function() {
        $(this).find('.offer_list').toggle();
    });

    $('.offer_list > A').click(function() {
        var $parent = $(this).closest('.offer_selector');
        var content = $(this).text();
        var value = $(this).data('value');

        $(this).parent().find("A").removeClass('selected');
        $(this).addClass('selected');
        $parent.data('value', value).find('.offer_recepient').find("SPAN").text(content);
    });

    //контекстное меню игрока
    $('.player_card').find('.message').click(function() {
        var $parent = $(this).closest('.player_card');
        var nickname = $parent.find('.nickname').text();
        var $chatInputArea = $('#chat-message-input');
        $chatInputArea.val('to['+nickname+']');
        $('#play-content').hide();
        $('#play-chat').show();
    });

    //закрыть окно с карточкой товара
    $('.close_window').click(function() {
       $('#asset-info').hide();
    });

/***********************************************************/
/*Демо-функции                                             */
/***********************************************************/
    //чат
    /*$('#chat-message-input').keypress(function(event) {
     if (event.which == 13) {
     event.preventDefault();
     }
     });*/

    //подсветка owner_name
    $('.owner_name').find('EM').click(function() {
         var playerNum = +this.className.replace('player', '');
         if (playerNum < 5) {
             playerNum++;
             $(this).removeClass().addClass('player'+playerNum);
         } else {
             $(this).removeClass();
         }
    });

    function RotateContentWindows(startPos) {
        var rotateElements = $('#play-content > DIV');
        var pos = startPos || 0;

        this.rotate = function() {
            rotateElements.hide();

            if (pos == rotateElements.length-1) {
                pos = 0;
            } else {
                pos++;
            }

            rotateElements.eq(pos).show();
        };

        this.resetPos = function(startPos) {
            pos = startPos || 0;
        }
    }

    var currentContentWindow = new RotateContentWindows(-1);

    $('#throw-dice').on('click', function(event) {
        $('#play-chat').hide();
        currentContentWindow.rotate();
        $('#play-content').show();
    });

    $('#buttons-stack A').on('click', function(event) {
        if (this.id.indexOf('to-') > -1) {
            var windowId = this.id.replace('to-', '');
            var $currentWindow = $('#' + windowId);

            if ($currentWindow.length > 0) {
                $('#play-chat').hide();
                $('#play-content > DIV').hide();
                $currentWindow.show();
                $('#play-content').show();

                currentContentWindow.resetPos(-1);
            }
        }
    });

});

function showPlayField() {
    $('BODY > *').hide();

    $('HTML').addClass('playfield');
    $('BODY').removeClass('native').addClass('playfield');

    $('#play-desc').show();
}

function hidePlayField() {
    $('#play-desc').hide();

    $('HTML').removeClass('playfield');
    $('BODY').removeClass('playfield').addClass('native');

    $('BODY > *').show();
}