var PLAYFIELD_DIR = '/playfield/'; /*для макета = ''*/

/***********************************************************/
/*объект игры                                              */
/***********************************************************/
function ActiveGame(game) {
    //private
    var self = this;

    var currentTurn = game;
    var prevTurn = {};

    var gameId = game['gameId'];

    var indexedPlayers = {};
    var indexedFields = {};

    var updatePlayersIndex = function() {
        currentTurn['players'].forEach(function(player, number) {
            var playerId = player['id'];
            var fieldId = player['fieldPosition'];

            if (!fieldId) {
                currentTurn['players'][number]['fieldPosition'] = 0;
            }

            indexedPlayers['player-'+playerId] = player;
            indexedPlayers['player-'+playerId]['num'] = number+1;
        });
    };

    var updateFieldsIndex = function() {
        currentTurn['fields'].forEach(function(field) {
            var fieldId = field['id'];
            indexedFields['field-'+fieldId] = field;
        });
    };

    //public
    this.getGameId = function() {
        return gameId;
    };

    this.getPlayerNumById = function(playerId) {
        if (indexedPlayers['player-' + playerId]) {
            return indexedPlayers['player-' + playerId]['num'];
        }
        return 0;
    };

    this.getPlayerNumByName = function(playerName) {
        for (var key in indexedPlayers) {
            if (indexedPlayers[key]['name'] == playerName) {
                return indexedPlayers[key]['num'];
            }
        }
        return 0;
    };

    this.getPlayerNameById = function(playerId) {
        if (indexedPlayers['player-' + playerId]) {
            return indexedPlayers['player-' + playerId]['name'];
        }
        return 0;
    };

    this.getPlayerCashById = function(playerId) {
        if (indexedPlayers['player-' + playerId]) {
            return indexedPlayers['player-' + playerId]['money'];
        }
        return 0;
    };

    this.getPlayersNames = function() {
        var names = [];
        for (var key in indexedPlayers) {
            names.push(indexedPlayers[key]['name']);
        }
        return names;
    };

    this.getPlayers = function() {
        return currentTurn['players'];
    };

    this.isActionAllowed = function(action, playerId) {
        var allowedActions = indexedPlayers['player-' + playerId]['allowedActions'];
        return allowedActions.indexOf(action) > -1;
    };

    this.updateAllPlayers = function(players) {
        currentTurn['players'] = players;
        updatePlayersIndex();
    };

    this.updatePlayer = function(player) {
        player['num'] = indexedPlayers['player-'+player['id']]['num'];
        indexedPlayers['player-'+player['id']] = player;
    };

    this.setCurrentTurn = function(game) {
        currentTurn = game;
        updatePlayersIndex();
        updateFieldsIndex();
    };

    this.getFieldOwnerById = function(fieldId) {
        return indexedFields['field-' + fieldId]['ownerId'];
    };

    this.getFieldStatusById = function(fieldId) {
        return indexedFields['field-' + fieldId]['firmState'];
    };

    this.getFieldStarsById = function(fieldId) {
        return indexedFields['field-' + fieldId]['starCount'];
    };

    this.getMonopolyOwner = function(fieldId) {
        var monopolyId = indexedFields['field-' + fieldId]['monopolyId'];
        var ownerId = 0;

        for (var key in indexedFields) {
            var field = indexedFields[key];
            if (field['monopolyId'] == monopolyId) {
                if (field['ownerId'] == -1 || ownerId > 0 && ownerId != field['ownerId']) {
                    return 0;
                } else if (ownerId == 0) {
                    ownerId = field['ownerId'];
                }
            }
        }

        return ownerId;
    };

    //init
    updatePlayersIndex();
}

/***********************************************************/
/*объект игрового поля                                     */
/***********************************************************/
function PlayField(user) {
    //private
    var self = this;
    var isShow = false;

    var $resizedSpace;
    var playFieldZoom = 1;

    var $cachedFields;

    var socketEmitter;

    var playFieldReady = $.Deferred();

    var listFields = {};
    var listMonopoly = {};

    var activeGame;

    var gameMode = '';
    var gameModeList = [];

    //нумерация сообщений в чате
    var chatCounter = 1;

    //id монополий на которых были построены звезды на текущем ходу
    var monopolyStars = [];

    /***********************************************************/
    /*Кеширование jQuery-объектов                              */
    /***********************************************************/
    //кеширование игровых полей
    var cacheFields = function() {
        var $cached = {};

        $('#play-desc > DIV').each(function(num) {
            var $self = $(this);
            $self.attr('id', 'field-'+num);

            $cached['cF-'+num] = {
                'parent': $self,
                'price': $self.find('.price').find('SPAN'),
                'icon': $self.find('.icon'),
                'holder': $self.find('.holder'),
                'lock': $self.find('.lock'),
                'locktime': $self.find('.lock').find('SPAN'),
                'upgrade': $self.find('.upgrade'),
                'stars1': $self.find('.stars1'),
                'stars2': $self.find('.stars2'),
                'stars3': $self.find('.stars3'),
                'stars4': $self.find('.stars4'),
                'stars5': $self.find('.stars5')
            }
        });

        $cached.getParent = function(fieldId) {
            return this['cF-'+fieldId]['parent'];
        };

        $cached.reset = function(fieldId) {
            this['cF-'+fieldId]['icon'].css({ 'background-image': 'url(' + PLAYFIELD_DIR + 'images/play_field_icons/icon_' + fieldId + '.png)' });
            this['cF-'+fieldId]['holder'].hide();
            this['cF-'+fieldId]['lock'].hide();
            this['cF-'+fieldId]['upgrade'].hide();
        };

        $cached.setOwner = function(fieldId, playerNum) {
            this['cF-'+fieldId]['icon'].css({ 'background-image': 'url(' + PLAYFIELD_DIR + 'images/play_field_icons/icon_' + fieldId + '_owned.png)' });
            this['cF-'+fieldId]['holder'].removeClass().addClass('holder player'+playerNum).show();
        };

        $cached.setPledged = function(fieldId, roundNumber) {
            //TODO: 10 - число ходов до перехода фирмы из залога в статус свободного поля, в идеале настройка берется с сервера
            this['cF-'+fieldId]['locktime'].html(10 - roundNumber);
            this['cF-'+fieldId]['lock'].show();
        };

        $cached.resetPledged = function(fieldId) {
            this['cF-'+fieldId]['lock'].hide();
        };

        $cached.setStars = function(fieldId, starsCount) {
            this['cF-'+fieldId]['upgrade'].hide();

            if (starsCount > 0) {
                this['cF-' + fieldId]['stars' + starsCount].show();
            }
        };

        return $cached;
    };

    /***********************************************************/
    /*Масштабирование                                          */
    /***********************************************************/
    //масштабирование полос прокрутки и ползунков
    var zoomScrollBars = function(zoomLevel) {
        var scrollBarParams = {
            'mCSB_scrollTools': ['width'],
            'mCSB_buttonUp': ['height'],
            'mCSB_draggerContainer': ['margin-top', 'margin-bottom'],
            'mCSB_buttonDown': ['height'],
            'slider1': ['padding-top'],
            'slider2': ['padding-bottom']
        };

        $.each(scrollBarParams, function (className, cssParams) {
            var $self = $('#play-field').find('.' + className);

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

    //масштабирование игрового поля
    var resizePlayField = function(eventType) {
        var $playSpaceWrapper = $('#play-space-wrapper');

        if (eventType == 'load') {
            $resizedSpace = $playSpaceWrapper.find('*');
        }

        //стороны поля - оригинал
        var maxWidth = parseInt($playSpaceWrapper.css('max-width'));
        var maxHeight = parseInt($playSpaceWrapper.css('max-height'));

        //стороны поля - текущие
        var currentWidth = $playSpaceWrapper.width();
        var currentHeight = $playSpaceWrapper.height();

        playFieldZoom = Math.max(maxHeight/currentHeight, maxWidth/currentWidth);

        $resizedSpace.zoomLayer(playFieldZoom, true);

        zoomScrollBars(playFieldZoom);

        //TODO: переписать масштабирование таблицы со статистикой
        //послеигровая статистика
        /*var $playStats = $('#play-stats');
        var $playStatsTable = $playStats.find('*');

        $playStatsTable.zoomLayer(playFieldZoom, true);*/
    };

    /***********************************************************/
    /*Подготовка объектов игрового поля перед запуском игры    */
    /***********************************************************/
    //расстановка игровых карточек
    //TODO: переписать с использованием кеширующих полей
    var renderPlayDesc = function (show_grid) {
        var $playDesc = $('#play-desc > DIV');

        //расположение элементов
        $playDesc.each(function(num) {
            var $self = $(this);
            var currentField = listFields['field-'+num];

            //линейные размеры элемента
            var elemWidth = parseInt($self.css('max-width')) || 0;
            var elemHeight = parseInt($self.css('max-height')) || 0;

            //отступ текущей иконки от предыдущей
            var elemLeft = parseInt($self.data('left')) || 0;
            var elemTop = parseInt($self.data('top')) || 0;
            var elemRight = parseInt($self.data('right')) || 0;
            var elemBottom = parseInt($self.data('bottom')) || 0;

            var owned = $self.hasClass("owned") ? "_owned" : "";

            renderPlayDesc.leftPos += elemLeft;
            renderPlayDesc.leftPos -= elemRight;
            renderPlayDesc.topPos += elemTop;
            renderPlayDesc.topPos -= elemBottom;

            if ($self.hasClass("bottom")) {
                renderPlayDesc.leftPos -= elemWidth;
            }

            if ($self.hasClass("left")) {
                renderPlayDesc.topPos -= elemHeight;
            }

            $self.css({
                'top' : renderPlayDesc.topPos + "px",
                'left' : renderPlayDesc.leftPos + "px"
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
                renderPlayDesc.leftPos += elemWidth;
            }

            if ($self.hasClass("right")) {
                renderPlayDesc.topPos += elemHeight;
            }

            //настройка игровых карточек
            if (currentField['type'] == 'Firm') {
                var purchasePrice = listMonopoly['monopoly-'+currentField['monopolyId']]['purchasePrice'];
                $self.find('.price').find('SPAN').html(purchasePrice+'k');
            }

            /*$self.css({
             'font' : 'bold 15px Arial',
             'color': '#000',
             'line-height': '20px'
             }).prepend('<em>'+num+'</em>');*/

        });

        //показать инфо по карточке фирмы или добавить/удалить фирму в окна заложить/выкупить, строить/продать, предложение
        $playDesc.click(function() {
            var $self = $(this);
            var assetId = $self.attr('id');

            if (listFields[assetId] && listFields[assetId]['type'] == 'Firm') {
                switch (gameMode) {
                    case 'pledge':
                    case 'redemption':
                    case 'pledge_redemption':
                        addAssetToPledgeList(assetId);
                        break;
                    case 'build':
                        addAssetToBuildStarsList(assetId);
                        break;
                    case 'sell':
                        addAssetToSellStarsList(assetId);
                        break;
                    case 'offer':
                        addAssetToOfferList(assetId);
                        break;
                    case 'open_auction':
                    case 'open_offer':
                        break;
                    default:
                        openInfoWindow(assetId);
                        break;
                }
            }
        });
    };

    //отрисовка карточек игроков
    var renderPlayerCards = function(players) {
        var $playerCards = $('#player-cards');

        $playerCards.html('').removeAttr('class');
        $playerCards.addClass('pcount'+players.length);

        players.forEach(function(player, num) {
            var $wrapper = $('<div></div>');

            if (num == 0) {
                $wrapper.addClass('card_top_wrapper');
            } else if (num == players.length-1) {
                $wrapper.addClass('card_bottom_wrapper');
            } else {
                $wrapper.addClass('card_middle_wrapper');
            }

            $wrapper.attr('id', 'player-'+(num+1));

            var $card = $('<div class="player_card"></div>');

            if (player['status'] == 'Bankrupt') {
                $card.append('<div class="defaulter"></div>');
            } else {
                $card.append('<div class="defaulter" style="display: none"></div>');
            }

            if (player['status'] == 'Prisoner') {
                $card.append('<div class="prisoner"></div>');
            } else {
                $card.append('<div class="prisoner" style="display: none"></div>');
            }

            if (player['commandNumber']) {
                $card.append('<div class="tag_team'+player['commandNumber']+'"></div>');
            }

            $card.append('<div class="nickname"><span>'+player['name']+'</span></div>');

            if (typeof player['money'] != 'undefined' && player['status'] != 'Bankrupt') {
                $card.append('<div class="cash"><span>'+player['money']+'</span></div>');
            } else if (player['status'] == 'Bankrupt') {
                $card.append('<div class="cash"><span>0</span></div>');
            } else {
                //TODO: сделать загрузку стартовой суммы с сервера
                $card.append('<div class="cash"><span>3000</span></div>');
            }

            if (typeof player['capital'] != 'undefined' && player['status'] != 'Bankrupt') {
                $card.append('<div class="sum"><span>' + player['capital'] + '</span></div>');
            } else if (player['status'] == 'Bankrupt') {
                $card.append('<div class="sum"><span>0</span></div>');
            } else {
                //TODO: сделать загрузку стартовой суммы с сервера
                $card.append('<div class="sum"><span>3000</span></div>');
            }

            //TODO: добавить аватар
            $card.append('<div class="userpic"><div></div></div>');

            $card.append('<div class="icons"><a class="message"></a><a class="gift"></a><a class="lens"></a><a class="friend"></a></div>');

            if (player['type'] == 'vip') {
                $card.append('<div class="vip_yes"></div>');
            } else {
                $card.append('<div class="vip_no"></div>');
            }

            //TODO: Отобразить текущий лимит времени
            $card.append('<div class="timelimit player'+(num+1)+'"><div></div></div>');

            $wrapper.append($card);
            $playerCards.append($wrapper);
        });
    };

    //отрисовка и расстановка фишек
    var renderPlayerChips = function(players) {
        var $chips = $('#chips');

        $chips.html('');
        players.forEach(function(player, num) {
            if (player['status'] != 'Bankrupt') {
                var $chip = $('<div class="player' + (num+1) + '"></div>').hide();
                $chips.append($chip);

                if (player['fieldPosition']) {
                    moveChip(num + 1, player['fieldPosition']);
                }

                $('#chips').find('.player' + (num+1)).show();
            }
        });
    };

    //установка исходных значений игрового поля
    var resetPlayField = function() {
        $('#throw-dice').hide();
        $('#buy-firm').hide();
        $('#to-build-stars').hide();
        $('#to-sell-stars').hide();
        $('#to-pledge').hide();
        $('#to-make-offer').hide();
        $('#to-auction').hide();
        $('#take-loan').hide();
        $('#repay-loan').hide();
        $('#to-pay').hide();

        if (activeGame.getPlayerNumById(user.getId())) {
            $('#surrender').show();
            $('#exit-game').hide();
        } else {
            $('#surrender').hide();
            $('#exit-game').show();
        }

        for (var key in listFields) {
            $cachedFields.reset(listFields[key]['id']);
        }

        $('#play-chat').find('.chat_screen').html('');
    };

    /***********************************************************/
    /*Управление отображением объектов игрового поля           */
    /***********************************************************/
    //форматирование системного сообщения для чата
    var parseChatMessage = function(message) {
        var playersNames = activeGame.getPlayersNames();

        for (var i = 0; i < playersNames.length; i++) {
            if (message.indexOf(playersNames[i]) > -1) {
                var playerNum = activeGame.getPlayerNumByName(playersNames[i]);

                message = message.replace(playersNames[i], '');
                return '<a href="#"><img src="'+ PLAYFIELD_DIR +'images/player_info_icon.png" class="icon"></a><span class="player'+ playerNum +'">'+ playersNames[i] +'</span>&nbsp;<span class="system">'+ message +'</span>';
            }
        }

        return '<span class="system">'+ message +'</span>';
    };

    //Добавление фирмы в окно строительства звезд
    var addAssetToBuildStarsList = function(assetId) {
        var monopolyObj = listMonopoly['monopoly-' + listFields[assetId]['monopolyId']];

        //звезду можно построить только если определен массив starRent в объекте монополии
        if (monopolyObj['starRent']) {
            var fieldId = parseInt(assetId.replace('field-', ''));
            var currentStarsCount = activeGame.getFieldStarsById(fieldId);

            var $build = $('#build-stars');
            var $buildWindow = $build.find('.icons_container');
            var $buildPrice = $build.find('.current_price').find('EM');

            //Проверка принадлежности монополии активному игроку
            //Проверка количества звезд на фирме
            if (activeGame.getMonopolyOwner(fieldId) == user.getId() && currentStarsCount < 5) {
                //Проверка наличия фирмы в текущем списке строительства
                if (gameModeList.indexOf(fieldId) === -1) {
                    //можно построить только одну звезду на каждой монополии игрока за один ход
                    if (monopolyStars.indexOf(monopolyObj['id']) === -1) {
                        var pendingAssetsPrice = calculateAssetsPrice(gameMode, gameModeList) + monopolyObj['starBuildingPrice'];
                        var playerCash = activeGame.getPlayerCashById(user.getId());

                        //если текущий баланс игрока позволяет добавить фирму для строительства звезды
                        if (playerCash >= pendingAssetsPrice) {
                            gameModeList.push(fieldId);
                            monopolyStars.push(monopolyObj['id']);

                            $buildPrice.html(pendingAssetsPrice);

                            var $item = $('\
                                    <a class="sell_item" id="' + gameMode + '-icon-' + fieldId + '">\
                                        <div class="sell_icon icon_tag' + fieldId + '"></div>\
                                        <div class="sell_price">\
                                            <div class="text_label"><span>Цена</span></div>\
                                            <div class="text_sum"><span>: ' + monopolyObj['starBuildingPrice'] + '</span></div>\
                                        </div>\
                                            <div class="sell_income">\
                                            <div class="text_label"><span>Прибыль</span></div>\
                                            <div class="text_sum"><span>: ' + monopolyObj['starRent'][currentStarsCount] + '</span></div>\
                                        </div>\
                                    </a>\
                            ');

                            $item.click(function (event) {
                                event.stopPropagation();

                                delAssetFromList(gameMode, fieldId);
                                monopolyStars.splice(monopolyStars.indexOf(monopolyObj['id']), 1);
                                $buildPrice.html(calculateAssetsPrice(gameMode, gameModeList));
                            });

                            $buildWindow.append($item);
                            $buildWindow.find('*').zoomLayer(playFieldZoom);
                        }
                    }
                } else {
                    delAssetFromList(gameMode, fieldId);
                    monopolyStars.splice(monopolyStars.indexOf(monopolyObj['id']), 1);
                    $buildPrice.html(calculateAssetsPrice(gameMode, gameModeList));
                }
            }
        }
    };

    var addAssetToSellStarsList = function(assetId) {
        var monopolyObj = listMonopoly['monopoly-' + listFields[assetId]['monopolyId']];

        var fieldId = parseInt(assetId.replace('field-', ''));
        var currentStarsCount = activeGame.getFieldStarsById(fieldId);

        var $sell = $('#sell-stars');
        var $sellWindow = $sell.find('.icons_container');
        var $sellPrice = $sell.find('.current_price').find('EM');

        if (activeGame.getMonopolyOwner(fieldId) == user.getId() && currentStarsCount >= 1) {
            if (gameModeList.indexOf(fieldId) === -1) {
                gameModeList.push(fieldId);

                $sellPrice.html(calculateAssetsPrice(gameMode, gameModeList));

                var $item = $('\
                        <a class="sell_item" id="' + gameMode + '-icon-' + fieldId + '">\
                            <div class="sell_icon icon_tag' + fieldId + '"></div>\
                                <div class="sell_price">\
                                <div class="text_label"><span>Цена</span></div>\
                                <div class="text_sum"><span>: ' + monopolyObj['starSalePrice'] + '</span></div>\
                            </div>\
                            <div class="sell_income">\
                                <div class="text_label"><span>Прибыль</span></div>\
                                <div class="text_sum"><span>: ' + monopolyObj['starRent'][currentStarsCount - 1] + '</span></div>\
                            </div>\
                        </a>\
                ');

                $item.click(function (event) {
                    event.stopPropagation();

                    delAssetFromList(gameMode, fieldId);
                    $sellPrice.html(calculateAssetsPrice(gameMode, gameModeList));
                });

                $sellWindow.append($item);
                $sellWindow.find('*').zoomLayer(playFieldZoom);
            } else {
                delAssetFromList(gameMode, fieldId);
                $sellPrice.html(calculateAssetsPrice(gameMode, gameModeList));
            }
        }
    };

    //Добавление фирмы в окно залога
    var addAssetToPledgeList = function(assetId) {
        var fieldId = parseInt(assetId.replace('field-', ''));

        var $pledge = $('#pledge');
        var $pledgeWindow = $pledge.find('.icons_container');
        var $pledgePrice = $pledge.find('.assets_amount').find('SPAN');

        if (activeGame.getFieldOwnerById(fieldId) == user.getId()) {
            if (gameMode == 'pledge_redemption') {
                if (activeGame.getFieldStatusById(fieldId) == 'Purchased' && !activeGame.getFieldStarsById(fieldId)) {
                    gameMode = 'pledge';
                    $('#pledge > .button_confirm').addClass('pledge');
                }

                if (activeGame.getFieldStatusById(fieldId) == 'Pledged') {
                    gameMode = 'redemption';
                    $('#pledge > .button_confirm').addClass('redeem');
                }
            }

            if (gameModeList.indexOf(fieldId) === -1) {
                if (gameMode == 'pledge' && activeGame.getFieldStatusById(fieldId) == 'Purchased' && !activeGame.getFieldStarsById(fieldId) ||
                        gameMode == 'redemption' && activeGame.getFieldStatusById(fieldId) == 'Pledged') {

                    gameModeList.push(fieldId);

                    $pledgePrice.html(calculateAssetsPrice(gameMode, gameModeList));

                    var $item = $('<a class="sell_item" id="'+ gameMode +'-icon-'+ fieldId +'"><div class="sell_icon icon_tag' + fieldId + '"></div></a>');
                    $item.click(function(event) {
                        event.stopPropagation();

                        delAssetFromList(gameMode, fieldId);
                        $pledgePrice.html(calculateAssetsPrice(gameMode, gameModeList));
                    });

                    $pledgeWindow.append($item);
                    $pledgeWindow.find('*').zoomLayer(playFieldZoom);
                }
            } else {
                delAssetFromList(gameMode, fieldId);
                $pledgePrice.html(calculateAssetsPrice(gameMode, gameModeList));
            }
        }
    };

    //Добавление фирмы в окно обмена
    var addAssetToOfferList = function(assetId) {
        var fieldId = parseInt(assetId.replace('field-', ''));
        var ownerId = activeGame.getFieldOwnerById(fieldId);

        if (activeGame.getFieldStatusById(fieldId) == 'Purchased' && !activeGame.getFieldStarsById(fieldId)) {
            var $offer = $('#make-offer');

            var $ownerWindow = $offer.find('.scroll_wrapper_left').find('.icons_container');
            var $ownerSum = $offer.find('.scroll_wrapper_left').next().find('SPAN');
            var ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);

            var $requestWindow = $offer.find('.scroll_wrapper_right').find('.icons_container');
            var $requestSum = $offer.find('.scroll_wrapper_right').next().find('SPAN');
            var requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);

            var $offerProfit = $offer.find('.offer_profit');

            if (ownerId == user.getId()) {
                if (gameModeList['offerFirms'].indexOf(fieldId) === -1) {
                    gameModeList['offerFirms'].push(fieldId);

                    ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                    $ownerSum.html(ownerSum);
                    updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);

                    var $item = $('<a class="sell_item" id="'+ gameMode +'-icon-'+ fieldId +'"><div class="sell_icon icon_tag' + fieldId + '"></div></a>');
                    $item.click(function(event) {
                        event.stopPropagation();

                        delAssetFromList(gameMode, fieldId);

                        var ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                        var requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);

                        $ownerSum.html(ownerSum);
                        updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);
                    });

                    $ownerWindow.append($item);
                    $ownerWindow.find('*').zoomLayer(playFieldZoom);
                } else {
                    delAssetFromList(gameMode, fieldId);

                    ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                    $ownerSum.html(ownerSum);
                    updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);
                }
            } else if (ownerId == gameModeList['opponent']['id']) {
                if (gameModeList['requestFirms'].indexOf(fieldId) === -1) {
                    gameModeList['requestFirms'].push(fieldId);

                    requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);
                    $requestSum.html(requestSum);
                    updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);

                    $item = $('<a class="sell_item" id="'+ gameMode +'-icon-'+ fieldId +'"><div class="sell_icon icon_tag' + fieldId + '"></div></a>');
                    $item.click(function(event) {
                        event.stopPropagation();

                        delAssetFromList(gameMode, fieldId);

                        var ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                        var requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);

                        $requestSum.html(requestSum);
                        updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);
                    });

                    $requestWindow.append($item);
                    $requestWindow.find('*').zoomLayer(playFieldZoom);
                } else {
                    delAssetFromList(gameMode, fieldId);

                    requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);
                    $requestSum.html(requestSum);
                    updateOfferProfit.call($offerProfit, ownerSum, requestSum, 0);
                }
            }
        }
    };

    //обновление счетчика
    var updateOfferProfit = function(offerSum, requestSum, direction) {
        var offerPersent = 0;

        if (offerSum > requestSum) {
            offerPersent = Math.round((offerSum - requestSum)*100/offerSum);

            if (direction) {
                this.removeClass('red green').addClass('green');
            } else {
                this.removeClass('red green').addClass('red');
            }
        } else if (offerSum < requestSum) {
            offerPersent = Math.round((requestSum - offerSum)*100/requestSum);

            if (direction) {
                this.removeClass('red green').addClass('red');
            } else {
                this.removeClass('red green').addClass('green');
            }
        } else {
            this.removeClass('red green').addClass('green');
        }

        this.find('SPAN').html(offerPersent + '<em>%</em>');
    };

    //удаление фирмы из окон залога, предложения, строительства филиала, продажи филиала
    var delAssetFromList = function(mode, id) {
        if (mode != 'offer') {
            gameModeList.splice(gameModeList.indexOf(id), 1);
        } else {
            if (gameModeList['offerFirms'].indexOf(id) > -1) {
                gameModeList['offerFirms'].splice(gameModeList['offerFirms'].indexOf(id), 1);
            } else {
                gameModeList['requestFirms'].splice(gameModeList['requestFirms'].indexOf(id), 1);
            }
        }

        $('#'+ mode + '-icon-' + id).remove();
    };

    //подсчет стомости ассетов в gameModeList
    var calculateAssetsPrice = function(mode, assets) {
        var fieldsPrice = 0;
        var dbKey = '';

        switch (mode) {
            case 'pledge':
                dbKey = 'pledgePrice';
                break;
            case 'redemption':
                dbKey = 'redemptionPrice';
                break;
            case 'build':
                dbKey = 'starBuildingPrice';
                break;
            case 'sell':
                dbKey = 'starSalePrice';
                break;
            case 'offer_pay':
                dbKey = 'purchasePrice';
                fieldsPrice += parseInt($('#make-offer-pay').val());
                break;
            case 'offer_obtain':
                dbKey = 'purchasePrice';
                fieldsPrice += parseInt($('#make-offer-obtain').val());
                break;
        }

        for (var i = 0; i < assets.length; i++) {
            var monopolyId = listFields['field-' + assets[i]]['monopolyId'];
            fieldsPrice += listMonopoly['monopoly-' + monopolyId][dbKey];
        }

        return fieldsPrice;
    };

    //передвижение фишки
    var moveChip = function(playerNum, nextFieldId) {
        var $nextField = $cachedFields.getParent(nextFieldId);
        var $chip = $('#chips').find('.player'+playerNum);

        //пока перемещаем тупо в центр поля
        var chipCoords = {
          'left': parseFloat($nextField.css('left')) + parseFloat($nextField.css('width'))/2  - parseFloat($chip.css('width'))/2 + 'px',
          'top': parseFloat($nextField.css('top')) + parseFloat($nextField.css('height'))/2 - parseFloat($chip.css('height'))/2 + 'px'
        };

        $chip.css(chipCoords);
    };

    //активация кнопок для доступных действий на текущем ходе
    var showButtons = function(allowedActions) {
        /*throwDices, capitulate, buyFirm, pay, openAuction, acceptAuction, refuseAuction, pledgeFirm, redemptionFirm, buildStar,
         saleStar, takeCredit, message, offer, acceptOffer, refuseOffer*/
        var actionsForButtons = {
            'throwDices': 'throw-dice',
            'buyFirm': 'buy-firm',
            'openAuction': 'to-auction',
            'pay': 'to-pay',
            'pledgeFirm': 'to-pledge',
            'redemptionFirm': 'to-pledge',
            'buildStar': 'to-build-stars',
            'saleStar': 'to-sell-stars',
            'offer': 'to-make-offer'
        };

        /*for (var i = 0; i < allowedActions.length; i++) {
            var buttonId = actionsForButtons[allowedActions[i]];
            if (buttonId) {
                $('#' + buttonId).show();
            }
        }*/

        if (allowedActions.indexOf('pledgeFirm') > -1 || allowedActions.indexOf('redemptionFirm') > -1) {
            delete actionsForButtons['redemptionFirm'];
        }

        for (var action in actionsForButtons) {
            var buttonId = actionsForButtons[action];
            if (allowedActions.indexOf(action) > -1) {
                $('#' + buttonId).show();
            } else {
                $('#' + buttonId).hide();
            }
        }
    };

    //открыть окно "Информация"
    var openInfoWindow = function(assetId) {
        $('#play-chat').hide();
        $('#play-content').hide();
        $('#play-content > DIV').hide();

        var monopolyObj = listMonopoly['monopoly-'+listFields[assetId]['monopolyId']];
        var iconId = assetId.replace('field-', '');
        var $assetInfo = $('#asset-info');

        $assetInfo.find('.asset_icon').removeClass().addClass('asset_icon icon_asset' + iconId);
        $assetInfo.find('.asset_name > SPAN').html(listFields[assetId]['title']);

        $assetInfo.find('.asset_price > .text_sum > SPAN').html(monopolyObj['purchasePrice']);
        $assetInfo.find('.asset_pledge > .text_sum > SPAN').html(monopolyObj['pledgePrice']);
        $assetInfo.find('.asset_redeem > .text_sum > SPAN').html(monopolyObj['redemptionPrice']);

        if (monopolyObj['starRent']) {
            //для обычных фирм
            $assetInfo.find('.build_price > .text_sum > SPAN').html(monopolyObj['starBuildingPrice']);
            $assetInfo.find('.sell_price > .text_sum > SPAN').html(monopolyObj['starSalePrice']);

            $assetInfo.find('.income_base > .text_sum > SPAN').html(monopolyObj['rent'][0]);
            $assetInfo.find('.income_monopoly > .text_sum > SPAN').html(monopolyObj['rent'][1]);

            $assetInfo.find('.income_stars1 > .text_sum > SPAN').html(monopolyObj['starRent'][0]);
            $assetInfo.find('.income_stars2 > .text_sum > SPAN').html(monopolyObj['starRent'][1]);
            $assetInfo.find('.income_stars3 > .text_sum > SPAN').html(monopolyObj['starRent'][2]);
            $assetInfo.find('.income_stars4 > .text_sum > SPAN').html(monopolyObj['starRent'][3]);
            $assetInfo.find('.income_stars5 > .text_sum > SPAN > EM').html(monopolyObj['starRent'][4]);
        } else {
            //для фирм на которых не строятся звезды
            $assetInfo.find('.build_price > .text_sum > SPAN').html(0);
            $assetInfo.find('.sell_price > .text_sum > SPAN').html(0);

            $assetInfo.find('.income_base > .text_sum > SPAN').html(0);
            $assetInfo.find('.income_monopoly > .text_sum > SPAN').html(0);

            $assetInfo.find('.income_stars1 > .text_sum > SPAN').html(monopolyObj['rent'][0]);
            $assetInfo.find('.income_stars2 > .text_sum > SPAN').html(monopolyObj['rent'][1]);
            $assetInfo.find('.income_stars3 > .text_sum > SPAN').html(monopolyObj['rent'][2]);
            $assetInfo.find('.income_stars4 > .text_sum > SPAN').html(monopolyObj['rent'][3]);
            $assetInfo.find('.income_stars5 > .text_sum > SPAN > EM').html(0);
        }

        $assetInfo.show();

        $('#play-content').show();
    };

    //открыть окно "Аукцион"
    var openAuctionWindow = function(auction) {
        $('#play-chat').hide();
        $('#play-content').hide();
        $('#play-content > DIV').hide();

        var fieldId = auction['firm']['id'];
        var price = auction['price'];
        var creatorId = auction['creatorId'];

        gameMode = 'open_auction';

        var $auctionWindow = $('#auction');
        $auctionWindow.find('.owner_name > SPAN > EM').removeClass().addClass('player'+activeGame.getPlayerNumById(creatorId));
        $auctionWindow.find('.owner_name > SPAN > EM').html(activeGame.getPlayerNameById(creatorId));
        $auctionWindow.find('.asset_icon').removeClass().addClass('asset_icon icon_asset'+fieldId);
        $auctionWindow.find('.asset_name > SPAN').html(listFields['field-'+fieldId]['title']);
        $auctionWindow.find('.current_price > SPAN > EM').html(price);
        $auctionWindow.show();

        $('#play-content').show();
    };

    //открыть окно "Предложение"
    var openOfferWindow = function(offer) {
        gameMode = 'open_offer';

        var $offer = $('#get-offer');

        $offer.find('.owner_name').find('EM').removeClass().addClass('player'+activeGame.getPlayerNumById(offer['beginner']['id']));
        $offer.find('.owner_name').find('EM').html(offer['beginner']['name']);

        $('#get-offer-pay').val(offer['offerMoney']);
        $('#get-offer-obtain').val(offer['requestMoney']);

        var $ownerWindow = $offer.find('.scroll_wrapper_left').find('.icons_container');
        var $ownerSum = $offer.find('.scroll_wrapper_left').next().find('SPAN');

        $ownerWindow.find('A').remove();

        var offerSum = offer['offerFirms'].reduce(function(sum, fObj) {
            $ownerWindow.append('<a class="sell_item"><div class="sell_icon icon_tag' + fObj['id'] + '"></div></a>');

            var monopolyId = listFields['field-' + fObj['id']]['monopolyId'];
            return sum + listMonopoly['monopoly-' + monopolyId]['purchasePrice'];
        }, 0);

        $ownerWindow.find('*').zoomLayer(playFieldZoom);
        $ownerSum.html(offerSum + offer['offerMoney']);

        var $requestWindow = $offer.find('.scroll_wrapper_right').find('.icons_container');
        var $requestSum = $offer.find('.scroll_wrapper_right').next().find('SPAN');

        $requestWindow.find('A').remove();

        var requestSum = offer['requestFirms'].reduce(function(sum, fObj) {
            $requestWindow.append('<a class="sell_item"><div class="sell_icon icon_tag' + fObj['id'] + '"></div></a>');

            var monopolyId = listFields['field-' + fObj['id']]['monopolyId'];
            return sum + listMonopoly['monopoly-' + monopolyId]['purchasePrice'];
        }, 0);

        $requestWindow.find('*').zoomLayer(playFieldZoom);
        $requestSum.html(requestSum + offer['requestMoney']);

        var $offerProfit = $offer.find('.offer_profit');
        updateOfferProfit.call($offerProfit, offerSum, requestSum, 1);

        $('#play-chat').hide();
        $('#play-content > DIV').hide();
        $offer.show();
        $('#play-content').show();
    };

    //отрисовка состояния игрового поля в текущий момент игры
    var setGamePosition = function(game) {
        activeGame.setCurrentTurn(game);

        game['fields'].forEach(function(field) {
            var fieldId = field['id'];
            var ownerId = field['ownerId'];

            if (ownerId) {
                if (ownerId != -1) {
                    $cachedFields.setOwner(fieldId, activeGame.getPlayerNumById(ownerId));

                    if (field['firmState'] == 'Pledged') {
                        $cachedFields.setPledged(fieldId, field['roundNumberFromPledged']);
                    } else {
                        $cachedFields.resetPledged(fieldId);
                    }

                    $cachedFields.setStars(fieldId, activeGame.getFieldStarsById(fieldId));
                } else {
                    $cachedFields.reset(fieldId);
                }
            }
        });

        game['players'].forEach(function(player, num) {
            var $wrapper = $('#player-'+(num+1));
            $wrapper.find('.cash').find('SPAN').html(player['money']);
            $wrapper.find('.sum').find('SPAN').html(player['capital']);

            if (player['id'] == user.getId()) {
                showButtons(player['allowedActions']);
            }

            if (player['status'] == 'Bankrupt') {
                $wrapper.find('.defaulter').show();
            } else if (player['status'] == 'Prisoner') {
                $wrapper.find('.prisoner').show();
            } else {
                $wrapper.find('.prisoner').hide();
            }
        });

        if (game['auction']) {
            var playerId = game['auction']['playerId'];
            if (playerId == user.getId()) {
                openAuctionWindow(game['auction']);
            }
        } else if (game['offer']) {
            playerId = game['offer']['opponent']['id'];
            if (playerId == user.getId()) {
                openOfferWindow(game['offer']);
            }
        }
    };

    //загрузка игрового поля
    var showPlayField = function() {
        $('BODY > *').hide();

        $('HTML').addClass('playfield');
        $('BODY').removeClass('native').addClass('playfield');

        //TODO: Сюда можно установить прогрессбар, в ожидании пока загружаются настройки поля

        playFieldReady.done(function() {
            $('#play-space').hide();
            $('#play-field').show();

            resizePlayField('load');

            $('#play-space').show();
            isShow = true;
        }).fail(function() {
            //TODO: Выводить сообщение об ошибке
        });
    };

    /***********************************************************/
    /*Обработчики данных с сервера                             */
    /***********************************************************/
    var loadEventListeners = function() {
        socketEmitter.on('nextResponse', function(jsonData){
            if (jsonData['success']) {
                var currentPlayer = jsonData['object'];
                showButtons(currentPlayer['allowedActions']);
                activeGame.updatePlayer(jsonData['object']);
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('playersChangedResponse', function(jsonData){
            if (jsonData['success']) {
                var lastPlayersPosition = activeGame.getPlayers();
                var currentPlayersPosition = jsonData['object'];

                currentPlayersPosition.forEach(function(player, num) {
                    var playerId = player['id'];
                    for (var i = 0; i < lastPlayersPosition.length; i++) {
                        if (lastPlayersPosition[i]['id'] == playerId) {
                            if (lastPlayersPosition[i]['fieldPosition'] != player['fieldPosition']) {
                                moveChip(num+1, player['fieldPosition']);
                            }
                            break;
                        }
                    }

                    var $wrapper = $('#player-'+(num+1));
                    $wrapper.find('.cash').find('SPAN').html(player['money']);
                    $wrapper.find('.sum').find('SPAN').html(player['capital']);

                    if (player['id'] == user.getId()) {
                        showButtons(player['allowedActions']);
                    }
                });

                activeGame.updateAllPlayers(jsonData['object']);
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('gameChangedResponse', function(jsonData){
            if (jsonData['success']) {
                setGamePosition(jsonData['object']);
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('commentResponse', function(jsonData){
            if (jsonData['success']) {
                var $chatWindow = $('#play-chat').find('.chat_screen');
                $chatWindow.prepend('<div id="chat-msg-'+ chatCounter +'">'+ parseChatMessage(jsonData['object']) +'</div>');

                $('#chat-msg-'+chatCounter).find('*').zoomLayer(playFieldZoom);
                chatCounter++
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('enterResponse', function(jsonData){
            if (jsonData['success']) {
                self.continue(jsonData['object']);
            } else {
                console.log('check: У авторизованного пользователя нет активной игры');
            }
        });

        socketEmitter.on('watchResponse', function(jsonData){
            if (jsonData['success']) {
                self.continue(jsonData['object']);
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('lossResponse', function(jsonData){
            if (jsonData['success']) {
                var playerId = jsonData['object']['id'];
                var playerNum = activeGame.getPlayerNumById(playerId);

                $('#player-'+playerNum).find('.defaulter').show();
                $('#player-'+playerNum).find('.icons').addClass('short_list');
                $('#player-'+playerNum).find('.message').hide();

                if (playerId == user.getId()) {
                    $('#exit-game').show();
                }
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('winResponse', function(jsonData){
            if (jsonData['success']) {
                //TODO: Вместо hide, показывать таблицу с послеигровой статой
                self.hide();
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });

        socketEmitter.on('exitResponse', function(jsonData){
            if (jsonData['success']) {
                self.hide();
            } else {
                console.log('Ошибка в '+jsonData['method']+' : ' + jsonData['error']);
            }
        });
    };

    /***********************************************************/
    /*Public-функции                                           */
    /***********************************************************/
    this.init = function(ws) {
        $cachedFields = cacheFields();

        var loadListFields = $.ajax({
            type : 'GET',
            url : PLAYFIELD_DIR + 'fields.json',
            cache : false,
            dataType: 'json',
            data: {  },

            success : function(data){
                data.forEach(function(field) {
                    listFields['field-'+field['id']] = field;
                });
            },

            error: function(data, status, error) {
                console.log(status + " : " + error);
            }
        });

        var loadListMonopoly = $.ajax({
            type : 'GET',
            url : PLAYFIELD_DIR + 'monopoly.json',
            cache : false,
            dataType: 'json',
            data: {  },

            success : function(data){
                data.forEach(function(monopoly) {
                    listMonopoly['monopoly-'+monopoly['id']] = monopoly;
                });
            },

            error: function(data, status, error) {
                console.log(status + " : " + error);
            }
        });

        $.when(loadListFields, loadListMonopoly).done(function() {
            //позиция первой карточки игрового поля в пикселях (по макету)
            renderPlayDesc.topPos = 10;
            renderPlayDesc.leftPos = 11;

            renderPlayDesc();

            //подключение скроллбаров
            $('#play-field').find('.scroll_window').mCustomScrollbar({
                theme: "light-2",
                alwaysShowScrollbar: 0,
                scrollButtons: {
                    enable: true
                }
            });

            //дополнительные контейнеры для ползунка
            $('#play-field').find('.mCSB_dragger_bar').html('<div class="slider1"><div class="slider2"><div class="slider3"></div></div></div>');

            //модификация игрового поля в зависимости от изменения размеров окна браузера
            $(window).resize(function(){
                if (isShow) {
                    resizePlayField('resize');
                }
            });

            //поля "деньги" в окне "Предложить обмен"
            $('#make-offer-pay').blur(function() {
                var money = parseInt($(this).val());
                var playerCash = activeGame.getPlayerCashById(user.getId());

                if (isNaN(money)) { money = 0 }
                if (money > playerCash) { money = playerCash }

                $(this).val(money);
                gameModeList['offerMoney'] = money;

                var ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                var requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);

                $('#make-offer').find('.scroll_wrapper_left').next().find('SPAN').html(ownerSum);
                updateOfferProfit.call($('#make-offer').find('.offer_profit'), ownerSum, requestSum, 0);
            });

            $('#make-offer-obtain').blur(function() {
                var money = parseInt($(this).val());
                var playerCash = activeGame.getPlayerCashById(gameModeList['opponent']['id']);

                if (isNaN(money)) { money = 0 }
                if (money > playerCash) { money = playerCash }

                $(this).val(money);
                gameModeList['requestMoney'] = money;

                var ownerSum = calculateAssetsPrice('offer_pay', gameModeList['offerFirms']);
                var requestSum = calculateAssetsPrice('offer_obtain', gameModeList['requestFirms']);

                $('#make-offer').find('.scroll_wrapper_right').next().find('SPAN').html(requestSum);
                updateOfferProfit.call($('#make-offer').find('.offer_profit'), ownerSum, requestSum, 0);
            });

            playFieldReady.resolve();
        });

        socketEmitter = ws;
        loadEventListeners();
    };

    this.start = function(game) {
        activeGame = new ActiveGame(game);

        resetPlayField();

        renderPlayerCards(game['players']);
        renderPlayerChips(game['players']);

        showPlayField();
    };

    this.continue = function(gameExtended) {
        activeGame = new ActiveGame(gameExtended);

        resetPlayField();

        renderPlayerCards(gameExtended['players']);
        renderPlayerChips(gameExtended['players']);
        setGamePosition(gameExtended);

        showPlayField();
    };

    this.hide = function() {
        $('#play-field').hide();

        $('HTML').removeClass('playfield');
        $('BODY').removeClass('playfield').addClass('native');

        $('BODY').children('[id!="play-field"]').show();
        isShow = false;
    };

    this.check = function() {
        var reqData = {
            'sid': user.getSid()
        };
        socketEmitter.emit('check', reqData);
    };

    this.watch = function(game) {
        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': game['gameId']
            }
        };
        socketEmitter.emit('watch', reqData);
    };

    this.throwDices = function() {
        $('#play-content').hide();
        $('#play-chat').show();
        $('#buttons-stack > *').hide();

        gameMode = '';
        monopolyStars = [];

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('throwDices', reqData);
    };

    this.buyFirm = function() {
        $('#play-content').hide();
        $('#play-chat').show();
        $('#buttons-stack > *').hide();

        gameMode = '';
        monopolyStars = [];

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('buyFirm', reqData);
    };

    this.capitulate = function() {
        $('#surrender').hide();

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('capitulate', reqData);
    };

    this.exit = function() {
        $('#exit-game').hide();

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('exit', reqData);
    };

    //аукцион
    this.openAuction = function() {
        $('#buttons-stack > *').hide();

        gameMode = '';

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('openAuction', reqData);
    };

    this.acceptAuction = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('acceptAuction', reqData);
    };

    this.refuseAuction = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('refuseAuction', reqData);
    };

    //оплатить
    this.pay = function() {
        $('#play-content').hide();
        $('#play-chat').show();
        $('#buttons-stack > *').hide();

        gameMode = '';
        monopolyStars = [];

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('pay', reqData);
    };

    //заложить/выкупить
    this.showPledgeWindow = function() {
        $('#to-pledge').hide();
        $('#play-content > DIV').hide();
        $('#play-chat').hide();

        gameMode = '';
        gameModeList = [];
        $('#pledge').find('.icons_container').html('');
        $('#pledge').find('.assets_amount').find('SPAN').html(0);
        $('#pledge > .button_confirm').removeClass('pledge redeem');

        if (activeGame.isActionAllowed('pledgeFirm', user.getId()) || activeGame.isActionAllowed('redemptionFirm', user.getId())) {
            gameMode = 'pledge_redemption';
            $('#pledge').show();
        }

        $('#play-content').show();
    };

    this.closePledgeWindow = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';
        gameModeList = [];

        $('#to-pledge').show();
    };

    this.submitPledge = function() {
        if (gameModeList.length > 0) {
            $('#play-content').hide();
            $('#play-chat').show();

            if (gameMode == 'pledge') {
                var method = 'pledgeFirm';
            } else {
                method = 'redemptionFirm';
            }

            var pledgeJSON = [];
            for (var i=0; i<gameModeList.length; i++ ) {
                pledgeJSON.push({'id': gameModeList[i]});
            }

            var reqData = {
                'sid': user.getSid(),
                'params': {
                    'gameId': activeGame.getGameId(),
                    'firms': pledgeJSON
                }
            };

            socketEmitter.emit(method, reqData);

            gameMode = '';
            gameModeList = [];
        }
    };

    //строить звезды
    this.showBuildStarsWindow = function() {
        $('#to-build-stars').hide();
        $('#play-content > DIV').hide();
        $('#play-chat').hide();

        gameMode = 'build';
        gameModeList = [];
        $('#build-stars').find('.icons_container').html('');
        $('#build-stars').find('.current_price').find('EM').html(0);

        $('#build-stars').show();
        $('#play-content').show();
    };

    this.closeBuildStarsWindow = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';

        for (var i=0; i<gameModeList.length; i++ ) {
            var monopolyId = listFields['field-'+gameModeList[i]]['monopolyId'];
            monopolyStars.splice(monopolyStars.indexOf(monopolyId), 1);
        }

        gameModeList = [];

        $('#to-build-stars').show();
    };

    this.submitBuildStars = function() {
        if (gameModeList.length > 0) {
            $('#play-content').hide();
            $('#play-chat').show();

            gameMode = '';

            var buildJSON = [];
            for (var i=0; i<gameModeList.length; i++ ) {
                buildJSON.push({'id': gameModeList[i]});
            }

            var reqData = {
                'sid': user.getSid(),
                'params': {
                    'gameId': activeGame.getGameId(),
                    'firms': buildJSON
                }
            };

            socketEmitter.emit('buildStar', reqData);
        }
    };

    //продать звезды
    this.showSellStarsWindow = function() {
        $('#to-sell-stars').hide();
        $('#play-content > DIV').hide();
        $('#play-chat').hide();

        gameMode = 'sell';
        gameModeList = [];
        $('#sell-stars').find('.icons_container').html('');
        $('#sell-stars').find('.current_price').find('EM').html(0);

        $('#sell-stars').show();
        $('#play-content').show();
    };

    this.closeSellStarsWindow = function() {
        gameMode = '';
        gameModeList = [];

        $('#play-content').hide();
        $('#play-chat').show();
        $('#to-sell-stars').show();
    };

    this.submitSellStars = function() {
        if (gameModeList.length > 0) {
            var sellJSON = [];
            for (var i=0; i<gameModeList.length; i++ ) {
                sellJSON.push({'id': gameModeList[i]});
            }

            gameMode = '';

            var reqData = {
                'sid': user.getSid(),
                'params': {
                    'gameId': activeGame.getGameId(),
                    'firms': sellJSON
                }
            };

            socketEmitter.emit('saleStar', reqData);

            $('#play-content').hide();
            $('#play-chat').show();
            $('#to-sell-stars').show();
        }
    };

    //сделать предложение по обмену
    this.showMakeOfferWindow = function() {
        $('#to-make-offer').hide();
        $('#play-content > DIV').hide();
        $('#play-chat').hide();

        gameMode = 'offer';
        gameModeList = {
            'opponent': { 'id': 0 }, "offerFirms":[], "requestFirms":[], "offerMoney":0, "requestMoney":0
        };

        $('#make-offer').find('.offer_recepient').find("SPAN").text('ВЫБЕРИТЕ ИГРОКА');
        $('#make-offer').find('.icons_container').html('');
        $('#make-offer').find('.assets_amount').find('SPAN').html(0);
        $('#make-offer').find('.cash_wrapper').find('INPUT').val(0);

        $('#make-offer-pay').val(0);
        $('#make-offer-obtain').val(0).prop('readonly', true);

        var $offerProfit = $('#make-offer').find('.offer_profit');
        $offerProfit.removeClass('red green').addClass('green');
        $offerProfit.find('SPAN').html('0<em>%</em>');

        var $offerList = $('#make-offer').find('.offer_list');
        var players = activeGame.getPlayers();

        $offerList.find('A').remove();
        players.forEach(function(player) {
            if (player['id'] != user.getId() && player['status'] != 'Bankrupt') {
                var playerNum = activeGame.getPlayerNumById(player['id']);

                $offerList.append('\
                    <a class="element1" data-value="'+ player['id'] +'">\
                        <div class="player'+ playerNum +'">\
                            <div><span>'+ player['name'] +'</span></div>\
                        </div>\
                    </a>\
                ');
            }
        });

        $offerList.find('A').click(function() {
            //выбор игрока
            var $parent = $(this).closest('.offer_selector');
            var content = $(this).text();
            var value = $(this).data('value');

            $(this).parent().find("A").removeClass('selected');
            $(this).addClass('selected');

            $parent.find('.offer_recepient').find("SPAN").text(content);
            gameModeList['opponent']['id'] = +value;

            //сброс значений в колонке запроса
            var $rightCol = $('#make-offer').find('.scroll_wrapper_right');

            $rightCol.find('.icons_container').html('');
            $rightCol.next().find('SPAN').html(0);

            gameModeList['requestFirms'] = [];
            gameModeList['requestMoney'] = 0;

            $('#make-offer-obtain').val(0).removeAttr('readonly');

            if (gameModeList['offerFirms'].length || gameModeList['offerMoney']) {
                $offerProfit.removeClass('red green').addClass('red');
                $offerProfit.find('SPAN').html('100<em>%</em>');
            } else {
                $offerProfit.removeClass('red green').addClass('green');
                $offerProfit.find('SPAN').html('0<em>%</em>');
            }
        });

        $offerList.find('*').zoomLayer(playFieldZoom);

        $('#make-offer').show();
        $('#play-content').show();
    };

    this.closeMakeOfferWindow = function() {
        gameMode = '';
        gameModeList = [];

        $('#play-content').hide();
        $('#play-chat').show();
        $('#to-make-offer').show();
    };

    this.submitOffer = function() {
        var correctOffer = gameModeList['opponent']['id'] && (gameModeList['offerFirms'].length || gameModeList['requestFirms'].length || gameModeList['offerMoney'] || gameModeList['requestMoney']);
        if (correctOffer) {
            gameMode = '';

            var offerJSON = gameModeList;
            var offerFirms = [];
            var requestFirms = [];

            for (var i=0; i<gameModeList['offerFirms'].length; i++ ) {
                offerFirms.push({'id': gameModeList['offerFirms'][i]});
            }

            offerJSON['offerFirms'] = offerFirms;

            for (i=0; i<gameModeList['requestFirms'].length; i++ ) {
                requestFirms.push({'id': gameModeList['requestFirms'][i]});
            }

            offerJSON['requestFirms'] = requestFirms;

            var reqData = {
                'sid': user.getSid(),
                'params': {
                    'gameId': activeGame.getGameId(),
                    'offer': offerJSON
                }
            };

            socketEmitter.emit('offer', reqData);

            $('#buttons-stack > *').hide();
            $('#play-content').hide();
            $('#play-chat').show();
        }
    };

    //принять/отклонить обмен
    this.acceptOffer = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('acceptOffer', reqData);
    };

    this.refuseOffer = function() {
        $('#play-content').hide();
        $('#play-chat').show();

        gameMode = '';

        var reqData = {
            'sid': user.getSid(),
            'params': {
                'gameId': activeGame.getGameId()
            }
        };
        socketEmitter.emit('refuseOffer', reqData);
    };
}

var playField = new PlayField(authUser);

/***********************************************************/
/*Функция для логирования элементов                        */
/***********************************************************/
var getElementName = function (domElement) {
    var name = domElement.tagName.toUpperCase();
    var $domElement = $(domElement);
    name += $domElement.attr('id') ? "[#"+$domElement.attr('id')+"]" : "";
    name += $domElement.attr('class') ? "[."+$domElement.attr('class')+"]" : "";
    return name;
};

/***********************************************************/
/*Плагин zoomLayer, для масштабирования игрового поля      */
/***********************************************************/
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
/*Обработчики событий                                      */
/***********************************************************/
    //выпадающий список на вкладке "Обмен"
    $(document).on('click', function(event) {
        if ($(event.target).closest('.offer_selector').length) return;
        $('.offer_list').hide();
    });

    $('.offer_selector').click(function() {
        $(this).find('.offer_list').toggle();
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
    $('#asset-info > .close_window').click(function() {
        $('#play-content').hide();
        $('#play-chat').show();
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

    //поля "Деньги" в окне предложения
    $('#make-offer-pay, #make-offer-obtain').keydown(function(event) {
        //Enter
        if (event.keyCode == 13) {
            $(this).blur();
            return;
        }

        //Backspace,Delete
        if (event.keyCode == 8 || event.keyCode == 46) {
            return;
        }

        //допустимый ввод - только числа
        if (!/^[0-9]$/.test(String.fromCharCode(event.keyCode))) {
            event.preventDefault();
        }

        if (event.keyCode != 13) {
            var symbol = String.fromCharCode(event.keyCode);
            if (!/^[0-9]$/.test(symbol)) {
                event.preventDefault();
            }
        } else {

        }
    });

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

    $('#throw-dice').click(function() {
        playField.throwDices();
    });

    $('#buy-firm').click(function() {
        playField.buyFirm();
    });

    $('#to-pay').click(function() {
        playField.pay();
    });

    $('#surrender').click(function() {
        playField.capitulate();
    });

    $('#exit-game').click(function() {
        playField.exit();
    });

    //аукцион
    $('#to-auction').click(function() {
        playField.openAuction();
    });

    $('#auction > .button_confirm').click(function() {
        playField.acceptAuction();
    });

    $('#auction > .button_cancel').click(function() {
        playField.refuseAuction();
    });

    //заложить/выкупить
    $('#to-pledge').click(function() {
        playField.showPledgeWindow();
    });

    $('#pledge > .button_confirm').click(function() {
        playField.submitPledge();
    });

    $('#pledge > .button_cancel').click(function() {
        playField.closePledgeWindow();
    });

    //строить звезды
    $('#to-build-stars').click(function() {
        playField.showBuildStarsWindow();
    });

    $('#build-stars > .button_confirm').click(function() {
        playField.submitBuildStars();
    });

    $('#build-stars > .button_cancel').click(function() {
        playField.closeBuildStarsWindow();
    });

    //продать звезды
    $('#to-sell-stars').click(function() {
        playField.showSellStarsWindow();
    });

    $('#sell-stars > .button_confirm').click(function() {
        playField.submitSellStars();
    });

    $('#sell-stars > .button_cancel').click(function() {
        playField.closeSellStarsWindow();
    });

    //сделать предложение по обмену
    $('#to-make-offer').click(function() {
        playField.showMakeOfferWindow();
    });

    $('#make-offer > .button_confirm').click(function() {
        playField.submitOffer();
    });

    $('#make-offer > .button_cancel').click(function() {
        playField.closeMakeOfferWindow();
    });

    //принять/отклонить обмен
    $('#get-offer > .button_confirm').click(function() {
        playField.acceptOffer();
    });

    $('#get-offer > .button_cancel').click(function() {
        playField.refuseOffer();
    });
});