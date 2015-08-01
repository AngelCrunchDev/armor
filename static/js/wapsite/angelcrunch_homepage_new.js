(function(){
    var self = this;
    this.api = {
        sd:base_mobile+'v3/speed_dating',
        stars:base_mobile+'v3/speed_dating'
    };
    this.default_param = {
        uid:account_info.id,
        access_token:account_info.token
    };
    this.get_data = function(url,call,data){
        base_remote_data.ajaxjsonp(url,function(data){
            call(data);
        },$.extend(true,self.default_param,data));
    };
}).call(define('page_base'));

(function(){
    var self = this,
        $base = $('.tag-group'),
        $selector = $base.children('.selector'),
        $first = $base.children('div').children('a'),
        $bk_menu = $('.bk-num'),
        $bk_text = $bk_menu.children('p');

    this.sta = {
        switch:true,
        current:1
    };

    this.item_active = function(index){
        var text = $first.removeClass('active').eq(index).addClass('active').children('h4').children('span').html();
        self.selector_active(index);
        setTimeout(function(){self.bk_text(text);},800);
    };
    this.selector_active = function(index){
        var t = index || 0;
        $selector.css('top',t*80+'px');
    };
    this.bk_active = {
        show:function(){
            $bk_menu.removeClass('fadeout').addClass('fadein');
        },
        hide:function(){
            $bk_menu.addClass('fadeout').removeClass('fadein');
        }
    };

    this.bk_text = function(t){
        $bk_text.html(t);
    };

    this.next_active = function(){
        self.item_active(self.sta.current);
        self.sta.current++;
        if(self.sta.current == 3){
            self.sta.current = 0;
        }
        setTimeout(self.bk_active.hide,0);
        setTimeout(self.bk_active.show,800);
    };

    this.init = function(){
        setInterval(function(){
            if(self.sta.switch){
                self.next_active();
            }
        },3000);
        self.item_active(0);
        setTimeout(self.bk_active.hide,0);
        setTimeout(self.bk_active.show,800);
    };

    self.init();

}).call(define('view_firstpage'));

(function(){
    var self = this;

    this.circle = Circles.create({
        id:           'circle',
        radius:       50,
        value:        0,
        maxValue:     100,
        maxTextValue: 100,
        width:        10,
        text:         function(value){return value + '%';},
        colors:       ['#cecece', '#ff3d00'],
        duration:     200,
        wrpClass:     'circles-wrp',
        textClass:    'circles-text',
        styleWrapper: true,
        styleText:    true
    });
    this.update_value = function(val){
        var v = val || 0;
        self.circle.setPercent(0);
        self.circle.updateMaxTextValue(v > 100 ? v : 0);
        self.circle.update(v);
    };

}).call(define('view_sd'));

(function(){
    var self = this,
        $list_selector = $('#sd-selector'),
        $list_contaner = $('#list-container'),
        $touch = $('#touch-zone'),
        $all_infozone = $('.pro-info-unit'),
        $btn_left = $touch.find('.left').children('em'),
        $btn_right= $touch.find('.right').children('em');

    this.list = [];
    this.list_index = 0;

    this.framework =  avalon.define("sd-list", function (vm) {
        vm.data = {
            name:'',
            district:'',
            day:30,
            finish:0,
            hope:0,
            concept:'',
            image:'',
            link:''
        };
        vm.list = [];
        vm.select = function(index){
            self.index(index);
        };
        vm.next = function(){
            self.next();
        };
        vm.prev = function(){
            self.prev();
        }
    });

    this.data_call = function(data){
        if(data.list){
            self.list = self.framework.list = data.list;
            self.info(0);
            self.btn_display(0);
        }
    };

    this.get_sd = page_base.get_data(page_base.api.sd,self.data_call,{pagesize:10,pageindex:2,w:600,state:'online',industryid:'',regionid:''})

    this.info = function(index){
        var c = {},f = 1,h = 1;
        if(!!self.list[index]){
            c = self.list[index];
            f = parseInt(c.finishamount.replace(/\.0/,'').replace(/\,/g,'').replace(/0{4}$/,''));
            h = parseInt(c.amount.replace(/\.0/,'').replace(/\,/g,'').replace(/0{4}$/,''));
            self.framework.data.name = c.name;
            self.framework.data.district = c.region;
            self.framework.data.day = c.day;
            self.framework.data.concept = c.concept;
            self.framework.data.image = c.image;
            self.framework.data.link = base_protocol+c.id+'.'+base_host;
            self.framework.data.finish = account_info.role >0 ?'￥'+ f + '万' : '投资人可见';
            self.framework.data.hope = account_info.role >0 ? '￥'+ h + '万' : '投资人可见';
            view_sd.update_value((f/h*100).toFixed(0));
        }
    };

    this.btn_display = function(index){
        index === 0?$btn_left.hide():$btn_left.show();
        index === self.list.length-1?$btn_right.hide():$btn_right.show();
    };

    this.next = function(){
        if(self.list_index+1 < self.list.length){
            self.index(self.list_index+1);
            self.keep_seen(self.list_index);
        }
    };

    this.prev = function(){
        if(self.list_index > 0 ){
            self.index(self.list_index-1);
            self.keep_seen(self.list_index);
        }
    };

    this.index = function(index){
        var i = parseInt(index);
        self.btn_display(i);
        $all_infozone.fadeOut(300,function(){self.info(i);$all_infozone.fadeIn(300)});
        self.selector(i);
        self.list_index = i;
    };

    this.selector = function(index){
        var i = index || 0;
        $list_selector.css('left',60*parseInt(i)+'px');
    };

    this.keep_seen = function(index){
        var i = index+ 1, w = $(window).width(), n = $list_contaner.scrollLeft(), num = Math.ceil(w/60),hide =Math.floor(n/60);
        if(i-hide>num-1){
            self.scroll_left()(Math.ceil(n+(i-hide-num+1)*60));
        }
        else{
            if(i<=hide+1){
                self.scroll_left()(Math.ceil(n+(i-hide-2)*60));
            }
        }
    };
    this.scroll_left = function(){
        var t = 0;
        return function(d){
            var n = 0,l = 0, s = 0;
            if(t){
                clearInterval(t);
            }
            else{
                n = $list_contaner.scrollLeft();
                l = (d-n)/(200/13);
                t = setInterval(function(){
                    if(s<200){
                        $list_contaner.scrollLeft(n+=l);
                        s+=13;
                    }
                    else{
                        $list_contaner.scrollLeft(n+=l);
                        clearInterval(t);
                    }
                },13);
            }
        }
    };

    this.touchtap = function(el,fun){
        var startX,
            startY,
            startT,
            start = function(event){
                var  e = event || window.event;
                startT = new Date().getTime();
                startX = e.touches[0].pageX;
                startY = e.touches[0].pageY;
            },
            end = function(event){
                var  e = event || window.event,
                    mX = e.changedTouches[0].pageX - startX,
                    mY = e.changedTouches[0].pageY - startY,
                    now= new Date().getTime(),
                    target = e.target || e.srcElement,
                    dom_tree = [target.parentNode,target.parentNode.parentNode],id = null;
                for(var i in dom_tree){
                    if(dom_tree[i].getAttribute('data-id')){
                        id = dom_tree[i].getAttribute('data-id');
                        break;
                    }
                }
                if(Math.abs(mX)<30 && Math.abs(mY)<30 && now - startT<200 && id != null){
                    fun(id);
                }
            };
        if(el.nodeType == 1){
            el.addEventListener('touchstart',start, false);
            el.addEventListener('touchend',end, false);
        }
    };
    this.touch = function(el,done){
        var startX,
            startY,
            start = function(event){
                var  e = event || window.event;
                startX = e.touches[0].pageX;
                startY = e.touches[0].pageY;
            },
            end = function(event){
                var  e = event || window.event,
                    mX = e.changedTouches[0].pageX - startX,
                    mY = e.changedTouches[0].pageY - startY;
                    done(mX,mY);
            };
            if(el.nodeType == 1){
                el.addEventListener('touchstart',start, false);
                el.addEventListener('touchend',end, false);
            }
    };
    self.touchtap(document.getElementById('list-container'),function(index){
        self.index(index);
    });
    self.touch(
        document.getElementById('touch-zone'),
        function(mx,my){
            if(Math.abs(my)<50 && Math.abs(mx)>50){
                if(mx<0){
                    self.next()
                }
                else{
                    self.prev();
                }
            }
        }
    );
}).call(define('view_sd'));

(function(){
    var self = this;

    this.framework =  avalon.define("stars-list", function (vm) {
        vm.list = [];
    });
    this.data_render = function(data){
        var ret = data || {};
        for(var i in ret){
            ret[i].link = base_protocol+ret[i].id+'.'+base_host;
            ret[i].district = ret[i].region == ''?'全国':ret[i].region.split(' ').splice(0,2).join(' · ');
            ret[i].industry = ret[i].industry.slice(0,24).split(' ').join(' · ');
        }
        return ret;
    };
    this.data_call = function(data){
        if(data.list){
            self.framework.list = self.data_render(data.list);
        }
    };

    this.get_sd = page_base.get_data(page_base.api.stars,self.data_call,{pagesize:10,pageindex:3,w:600,state:'online',industryid:'',regionid:''});


}).call(define('view_stars'));