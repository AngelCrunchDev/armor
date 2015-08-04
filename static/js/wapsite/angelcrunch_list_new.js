(function(){
    this.key = {
        search_record:'com_search_history'
    };
    this.api = {
        comlist:base_mobile+'v3/startup',
        searchlist:base_mobile+'v2/startup_search',
        sdlist:base_mobile+'v3/speed_dating'
    };
    log.type = 'com_list';
}).call(define('config'));

(function(){
    var self = this,
        $bk = $('.bk_new'),
        $notice = $('.notification'),
        $filter = $('.filter-occupy'),
        $loading = $('.loading-container'),
        $not_found = $('.not-found');

    this.bk={
        show:function(){
            if(self.bk.timer)clearTimeout(self.bk.timer);
            $bk.show().addClass('fadeTransIn');
        },
        hide:function(){
            $bk.removeClass('fadeTransIn');
            self.bk.timer = setTimeout(function(){$bk.hide();},200);
        },
        event:function(){
            //取消搜索
            base_helper.delay(function(){
                controll_search.stop_search();
            },200);
            view_filter.list.hide();
            view_filter.select_active();
        },
        timer:0
    };

    this.notification={
        show:function(text,isalert){
            $notice.fadeIn().children('.txt').html(text);
            if(typeof isalert!='undefined' && !isalert){
                $notice.removeClass('red').addClass('green');
            }
            else{
                $notice.removeClass('green').addClass('red');
            }
            $notice.delay(3000).fadeOut();
        },
        hide:function(){
            $notice.fadeOut();
        }
    };

    this.loading = {
        show:function(){
            base_helper.scroll_to(0);
            $loading.show();
        },
        hide:function(){
            $loading.hide();
        }
    };

    this.not_found = {
        sta:false,
        show:function(){
            $not_found.show();
            self.not_found.sta = true;
        },
        hide:function(){
            $not_found.hide();
            self.not_found.sta = false;
        }
    };
    this.error = function(){
        self.notification.show('网络错误');
    };


    this.filter = {
        show:function(){
            $filter.show();
        },
        hide:function(){
            $filter.hide();
        }
    };
    /*背景事件整理*/
    $bk.touchtap(self.bk.event);
}).call(define('view_dom'));

(function(){

    var $btn=$('.search'),
        $searchmodel=$('.search-list'),
        $input=$searchmodel.find('input'),
        self = this,
        search_sta = false;

    /*view*/
    this.input = {
        foucus:function(){
            $input.focus();
        },
        blur:function(){
            $input.blur();
        },
        fill:function(k){
            var kk=k||'';
            $input.val(kk);
        }
    };

    this.btn = {
        show:function(){
            $btn.addClass('active');
        },
        hide:function(){
            $btn.removeClass('active');
        }
    };

    this.module = {
        show:function(){
            $searchmodel.fadeIn();
        },
        hide:function(){
            $searchmodel.fadeOut();
        }
    };

    this.start_search = function(){
        if(!search_sta){
            self.btn.show();
            self.module.show();
            self.show_history();
            self.input.foucus();
            self.input.fill();
            view_dom.bk.show();
            search_sta = true;
        }
        else{
            self.word_search($input.val());
        }

    };

    this.cancel_search = function(){
        setTimeout(self.stop_search,300);
        route.go_history();
    };

    this.stop_search = function(){
        self.btn.hide();
        self.module.hide();
        self.input.blur();
        self.search.result_name ='';
        view_dom.bk.hide();
        search_sta = false;
    };

    this.word_search = function(k){
        if(k != ''){
            self.btn.hide();
            self.input.blur();
            self.search.result_name ='';
            view_dom.bk.hide();
            search_sta = false;
            route.go({type:'search', k:k, p:1});
        }
    };

    this.search_result = function(n){
        var k = base_hash_model.get_data('k');
        self.input.fill(k);
        self.input.blur();
        self.module.hide();
        self.record_search(k);
        view_dom.bk.hide();
        view_dom.filter.hide();
        self.search.result_name = k;
        self.search.result_num = n;
    };

    this.search_history = function(){
        if(!!this.innerHTML){
            self.word_search(this.innerHTML);
        }
    };

    this.input_search = function(e){
        if(e.keyCode == 13){
            self.word_search(this.value);
        }
    };

    this.local_history = function(){
        return base_local_data.getdata(config.key.search_record) || [];
    };

    this.clear_history = function(){
        base_local_data.savedata(config.key.search_record,[]);
        self.search.history = [];
    };

    this.show_history = function(){
        self.search.history = self.local_history();
    };

    this.record_search = function(k){
        var local_history = self.local_history();
        if(local_history.indexOf(k)==-1){
            local_history.unshift(k);
        }
        base_local_data.savedata(config.key.search_record,local_history);
    };

    this.search = avalon.define("search", function (vm) {
        vm.history = [];
        vm.result_name = '';
        vm.result_num = 0;
    });

}).call(define('controll_search'));

(function(){
    var self = this,
        $sd_box = $('.sd-list'),
        $normal = $('.section-list'),
        $turning= $('.page-turn'),
        $prev   = $turning.children('.prev-page'),
        $next   = $turning.children('.next-page'),
        $current= $turning.children('p').children('.current-page'),
        $total  = $turning.children('p').children('.total-page');

    this.search = function(data){
        $sd_box.hide();
        $normal.show();
        self.page_turning(data);
        if(data.hasOwnProperty('total')){
            controll_search.search_result(data.total);
        }
    };

    this.sd = function(data){
        $sd_box.show();
        $normal.hide();
        view_dom.filter.show();
        self.page_turning(data,10);
    };

    this.com = function(data){
        $sd_box.hide();
        $normal.show();
        view_dom.filter.show();
        self.page_turning(data);
    };

    this.page_turning = function(data,size){
        var s = size || 10;
        if(data.hasOwnProperty('pageindex') && data.hasOwnProperty('total')){
            self.turning(data.pageindex,data.total,s);
        }
    };

    this.turning = function(index,total,size){
        var s = size || 10,
            page = Math.ceil(parseInt(total)/s),
            prev = index-1 > 1 ? index-1: 1,
            next = index+1 < page ? index+1 :page,
            hash_prev = base_hash_model.save_data({p:prev}),
            hash_next = base_hash_model.save_data({p:next});
        $prev.attr('href',hash_prev);
        $next.attr('href',hash_next);
        $current.html(index);
        $total.html(page);
    };

}).call(define('view_list'));

(function(){
    var self = this,
        default_param = {
            access_token:account_info.token,
            uid:account_info.id
        },
        comlist_default = $.extend({},default_param,{type:0,pagesize:10}),
        sdlist_default = $.extend({},default_param,{pagesize:10,w:600,state:'online'}),
        loading = {
            start: function(){
                view_dom.loading.show();
                if(view_dom.not_found.sta){
                    view_dom.not_found.hide();
                }
            },
            end:view_dom.loading.hide
        },
        error = view_dom.error;

    //全部项目 搜索列表 页面数据填充
    this.com_list = avalon.define("list", function (vm) {
        vm.data = [];
    });

    //闪投项目 页面数据填充
    this.sd_list = avalon.define("sd-list", function (vm) {
        vm.data = [];
    });

    //数据格式化
    this.list_render = function(data){
        var render=data,l;
        l=render.length;
        while(l){
            if(typeof render[(l-1)].finishamount=='string'){
                render[(l-1)].finishamount=parseInt(render[(l-1)].finishamount.replace(/\.0/,'').replace(/\,/g,'').replace(/0{4}$/,''));
            }
            if(typeof render[(l-1)].amount == 'string'){
                render[(l-1)].amount=parseInt(render[(l-1)].amount.replace(/\,/g,'').replace(/0{4}$/,''));
            }
            l--;
        }
        return render;
    };

    //全部项目 数据获取回调
    this.com_list_call = function(data){
        if(data.hasOwnProperty('list')){
            self.com_list.data= self.list_render(data.list);
        }
        if(data.hasOwnProperty('total')){
            data.total==0 && view_dom.not_found.show();
        }
        view_list.com(data);
    };

    //搜索列表 数据回调方法
    this.search_list_call =function(data){
        if(data.hasOwnProperty('list')){
            self.com_list.data= self.list_render(data.list);
        }
        if(data.hasOwnProperty('total')){
            data.total==0 && view_dom.not_found.show();
        }
        view_list.search(data);
    };

    //闪投列表 数据回调
    this.sd_list_call = function(data){
        if(data.hasOwnProperty('list')){
            self.sd_list.data = self.list_render(data.list);
        }
        if(data.hasOwnProperty('total')){
            data.total==0 && view_dom.not_found.show();
        }
        view_list.sd(data);
    };

    //全部项目 数据获取方法初始化
    this.com_list_get = base_data_model.init('com',config.api.comlist,comlist_default,self.com_list_call,error,loading);

    //全部项目 获取数据方法
    this.com_list_index = function(index,industry,district,order){
        var post ={
            pageindex:index || 1,
            industryid:industry || '',
            regionid:district || '',
            order:(!!order && order == 'new')?'new':'heat'
        };
        self.com_list_get(post);
    };

    //搜索列表 数据获取方法初始化
    this.search_list_get = base_data_model.init('search',config.api.searchlist,comlist_default,self.search_list_call,error,loading);

    //搜索列表 获取数据
    this.search_list_index = function(index,keyword){
        self.search_list_get({pageindex:index,keyword:keyword});
    };

    //闪投列表 数据获取方法初始化
    this.sd_list_get = base_data_model.init('sd',config.api.sdlist,sdlist_default,self.sd_list_call,error,loading);

    //闪投列表 获取数据
    this.sd_list_index = function(index,industry,district,state){
        var post ={
            pageindex:index || 1,
            industryid:industry || '',
            regionid:district || '',
            state:(!!state && state == 'success') ? 'success' :'online'
        };
        self.sd_list_get(post);
    }
}).call(define('controll_list'));

(function(){
    var self = this,
        history = [{}];

    //路由核心逻辑处理
    this.core = function(){
        var data = base_hash_model.get_data(),
            p = data.p || 1,
            industry = data.industry || '',
            district= data.district || '',
            order = data.order || '',
            state = data.state || '',
            k = data.k ||'';
        if(!!data.type){
            self.record_history(data);
            if(data.type == 'search' && !!data.k){
                return controll_list.search_list_index(p,data.k);
            }
            if(data.type == 'sd'){
                return controll_list.sd_list_index(p,industry,district,state);
            }
            if(data.type == 'com'){
                return controll_list.com_list_index(p,industry,district,order);
            }
        }
        self.go({type:'sd'});
    };
    //状态记录 列表类型间切换
    this.record_history = function(hash_data){
        var l = history.length - 1;
        if((l == 0 && !history[l].type) || (!!history[l].type && history[l].type != hash_data.type)){
            history.push(hash_data);
            if(l > 0){
                history.splice(0,1);
            }
        }
        else{
            history[l] = hash_data;
        }
    };
    this.go_history = function(){
        self.jump(history[0]);
    };
    this.jump = function(data){
        location.hash = base_hash_model.set_data(data);
    };
    this.go = function(data){
        location.hash = base_hash_model.save_data(data);
    };

    window.onhashchange = self.core;
    self.core();
}).call(define('route'));

(function(){
    var self = this,
        $filter = $('#list-filter'),
        $select = $filter.children().children('a'),
        $list = $filter.children('ul'),
        $win = $(window),
        hash_data = base_hash_model.get_data();

    this.view_filter={
        show:function(){
            $filter.addClass('top');
        },
        hide:function(){
            $filter.removeClass('top');
        }
    };
    this.list={
        show:function(){
            $list.addClass('active');
            self.bk.lock = false;
        },
        hide:function(){
            $list.removeClass('active');
            self.bk.lock = true;
        }
    };
    this.bk = {
        lock:true,
        show:function(){
            view_dom.bk.show();
        },
        hide:function(){
            !self.bk.lock && view_dom.bk.hide();
        }
    };

    $win.scroll(function(){
        var n = document.body.scrollTop;
        if(n > 75){
            self.view_filter.show();
        }
        if(n < 46){
            self.bk.hide();
            self.list.hide();
            self.view_filter.hide();
            self.select_active();
        }
    });
    this.filter_acitve=function(index){

        if(document.body.scrollTop>75){
            self.list.show();
            self.bk.show();
            self.select_active(index);
        }
        else{
            base_helper.scroll_to(80,function(){
                setTimeout(function(){
                    self.list.show();
                    self.bk.show();
                    self.select_active(index);
                },300);
            },100);
        }
    };
    this.select_active=function(index){
        $select.removeClass('active');
        if(typeof index != 'undefined'){
            $select.eq(index).addClass('active');
        }
    };
    this.debug=function(){
        return $select;
    };
    this.active_offset = 0;
    this.curret_type = 1;
    this.com_active = (!!hash_data.type && hash_data.type == 'sd')?'闪投项目':'全部项目';
    this.industry_active = !!hash_data.industry ? hash_data.industry : '全部行业';
    this.district_active = !!hash_data.district ? hash_data.district : '全部地区';
    this.sd_state_active = (!!hash_data.state && hash_data.state == 'success')?'完成融资':'正在热投';
    this.order_active = (!!hash_data.order && hash_data.order == 'new')?'时间排序':'热度排序';

    this.check_active = function(array,k,t){
      self.curret_type = t;
          for(var i in array){
              if(array[i] == k){
                  self.active_offset = i;
                  break;
              }
          }
      return array;
    };
    this.select_action = function(){
      var hash_data = {};
        base_helper.scroll_to(0);
        hash_data.type = self.com_active == '闪投项目'?'sd':'com';
        hash_data.industry = self.industry_active == '全部行业'?'':self.industry_active;
        hash_data.district = self.district_active == '全部地区'?'':self.district_active;
        if(hash_data.type == 'sd'){
            hash_data.state = self.sd_state_active == '正在热投'? 'online' : 'success';
        }
        else{
            hash_data.order = self.order_active == '热度排序' ? 'heat' : 'new';
        }
        route.jump(hash_data);
    };

    this.industry_list = ["全部行业","电子商务","移动互联网","信息技术","游戏","旅游","教育","金融","社交","娱乐","硬件","能源","医疗健康","餐饮","企业","平台","汽车","数据","房产酒店","文化艺术","体育运动","生物科学","媒体资讯","广告营销","节能环保","消费生活","工具软件","资讯服务","智能设备"];
    this.district_list = ['全部地区','北京','上海','深圳','广州','杭州','南京','西安','成都','苏州','天津','无锡','武汉','重庆','厦门','青岛'];
    this.page_list     = ['闪投项目','全部项目'];
    this.sd_state_list = ['正在热投','完成融资'];
    this.order_list    =  ['热度排序','时间排序'];
    this.avalon_filter = avalon.define("list-filter", function (vm) {
        vm.page_name= self.com_active;
        vm.industry_name= self.industry_active;
        vm.district_name= self.district_active;
        vm.sd_state_name= self.sd_state_active;
        vm.order_name = self.order_active;
        vm.list_content= self.page_list.concat();
        vm.list_page=function(){
            self.filter_acitve(0);
            self.avalon_filter.list_content=self.check_active(self.page_list.concat(),self.com_active,1);
        };
        vm.list_industry=function(){
            self.filter_acitve(1);
            self.avalon_filter.list_content=self.check_active(self.industry_list.concat(),self.industry_active,2);
        };
        vm.list_district=function(){
            self.filter_acitve(2);
            self.avalon_filter.list_content=self.check_active(self.district_list.concat(),self.district_active,3);
        };
        vm.sd_state = function(){
            self.filter_acitve(3);
            self.avalon_filter.list_content=self.check_active(self.sd_state_list.concat(),self.sd_state_active,4);
        };
        vm.order = function(){
            self.filter_acitve(4);
            self.avalon_filter.list_content=self.check_active(self.order_list.concat(),self.order_active,5);
        };
        vm.select_this=function(){
            var val =this.innerHTML,
                hash = {};
            self.select_active();
            base_helper.delay(function(){
                self.bk.hide();
                self.list.hide();
            },200);
            switch (self.curret_type){
                case 1:
                    self.com_active = self.avalon_filter.page_name = val;
                    break;
                case 2:
                    self.industry_active = self.avalon_filter.industry_name = val;
                    break;
                case 3:
                    self.district_active = self.avalon_filter.district_name = val;
                    break;
                case 4:
                    self.sd_state_active = self.avalon_filter.sd_state_name = val;
                    break;
                case 5:
                    self.order_active = self.avalon_filter.order_name = val;
                    break;
                default :
            }
            self.select_action();
        };

    });
}).call(define('view_filter'));