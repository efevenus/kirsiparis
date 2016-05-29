angular.module('noodlio.controllers-items', [])


.controller('ItemsCtrl', function($location, $timeout, $anchorScroll, $stateParams, $state, 
    Auth, Products, Utils) {
        
    var items               = this;
    items.AuthData          = Auth.AuthData;
    items.ProductsMeta      = {};
    items.ProductsIcons     = {};
    items.status = {
        loading: true,
        productType: 'local',
        q: ""
    };
    
    items.initView = function(state) {
        $location.hash('page-top');
        $anchorScroll();
        
        checkAuth();
        
        if(state != 'featured') {
            loadLatestItems();
        } else {
            // load all items
            //loadAllItems();
            loadFeaturedItems(items.status['productType']);
        }
    };
    
    function checkAuth() { // can be put in a resolve in app.js
        if(!Auth.AuthData.hasOwnProperty('uid')) {
            Auth.checkAuthState().then(
                function(loggedIn){
                    items.AuthData = Auth.AuthData;
                },
                function(notLoggedIn) {
                    $state.go('admin.login')
                }
            )
        };
    };

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // FEATURED MANAGEMENT
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    
    items.changeProductType = function() {
        loadFeaturedItems(items.status['productType']);
    };
    
    
    function initFeatured() {
        items.FeaturedProductsMeta = {
            local: {},
            online: {},
            voucher: {}
        };
        items.FeaturedList = {
            local: {},
            online: {},
            voucher: {}
        };
    };
    
    function loadFeaturedItems(productType) {
        console.log('loading', productType)
        // get products meta
        initFeatured();
        items.status['loading'] = true;
        if(items.AuthData.hasOwnProperty('uid')) {
           Products.getFeaturedProductMeta(productType).then(
                function(ProductsMeta){ 
                    // Init view
                    if(ProductsMeta != null) {
                        items.FeaturedProductsMeta[productType] = Utils.arrayValuesAndKeysProducts(ProductsMeta);
                        console.log(items.FeaturedProductsMeta)
                        items.status['loading'] = false;
                    } else {
                        items.status['loading'] = null;
                    };
                },
                function(error){
                    if(error == null) {
                        items.status['loading'] = null;
                    } else {
                        items.status['loading'] = false;
                    }
                    console.log(error)
                }
            )
        };
        
        // get the list (duplicate but it works)
        Products.getFeaturedList(items.status.productType).then(
            function(FeaturedList){
                if(FeaturedList != null) {
                    items.FeaturedList[items.status.productType] = FeaturedList;
                    console.log(items.FeaturedList)
                }
            },
            function(error){
                items.status['generalmessage'] = 'Could not retrieve list';
            }
        );
    };
    
    items.addToFeatured = function(key) {
        items.FeaturedList[items.status.productType][key] = true;
        updateFeatured();
    };
    
    items.removeFromFeatured = function(key) {
        console.log('deleting', key)
        delete items.FeaturedList[items.status.productType][key];
        updateFeatured();
    };
    
    function updateFeatured() {
        console.log(items.FeaturedList);
        Products.updateFeaturedList(items.status.productType, items.FeaturedList[items.status.productType]).then(
            function(success){
                items.status['generalmessage'] = 'List updated';
                loadFeaturedItems(items.status['productType']);
                
            },
            function(error){
                items.status['generalmessage'] = 'Could not update list';
            }
        )
    };
    
    // fn helper
    
    items.SearchedProductsMeta = {};
    items.search = function() {
        
        if(items.status.q != undefined && items.status.q != null && items.status.q != "") {
            
            items.SearchedProductsMeta = {};
            console.log('search started', items.status.q)
            
            items.status['showResults'] = true;
            items.status["searched"]      = true;
            
            // retrieve the search results
            Products.search(items.status.q, 100).then(
                function(ProductsMeta){
                    console.log(ProductsMeta)
                    handleUpdate(ProductsMeta);
                }, function(error){
                    console.log(error)
                    // handle error
                    items.status["searched"]      = false;
                    items.status['generalmessage'] = "Sorry, something went wrong";
                }
            );
        };
        
        
        // fn update sync
        function handleUpdate(ProductsMeta){
            items.status['generalmessage']        = false;
            
            var ProductsMetaTemp = {};
            
            // prepare
            angular.forEach(ProductsMeta, function(value, keyQuery){
                angular.forEach(ProductsMeta[keyQuery], function(value, productId){
                    //console.log(value, productId)
                    if(value != null) {
                        ProductsMetaTemp[productId] = value;
                    }
                })
            })
            
            // process
            if(Object.keys(ProductsMetaTemp).length == 0) {
                items.status['noResults']          = true;
                items.status["searched"]      = false;
            } else {
                
                items.status['noResults']          = false;
                items.status["searched"]      = false;
                
                items.SearchedProductsMeta                   = Utils.arrayValuesAndKeysProducts(ProductsMetaTemp);

            }
        };
    };
    
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // ITEM MANAGEMENT
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    
    items.ProductsMeta = {}
    function loadLatestItems() {
        items.ProductsMeta = {};
        items.status['loading'] = true;
        if(items.AuthData.hasOwnProperty('uid')) {
            Products.filter('userId', items.AuthData.uid, 'timestamp_update', LIMITVALUE).then(
                function(ProductsMeta){ 
                    // Init view
                    if(ProductsMeta != null) {
                        items.ProductsMeta = Utils.arrayValuesAndKeysProducts(ProductsMeta);
                        items.status['loading'] = false;
                    } else {
                        items.status['loading'] = null;
                    };
                },
                function(error){
                    if(error == null) {
                        items.status['loading'] = null;
                    } else {
                        items.status['loading'] = false;
                    }
                    console.log(error)
                }
            )
        }
    };
    
    // fn delete
    items.deleteItem = function(key) {
        Products.deleteProduct(key, items.AuthData).then(
            function(success){
                loadLatestItems();
            },
            function(error){
                console.log(error)
                items.status['generalmessage'] = 'Something went wrong...'
            }
        )
    };

    // custom functions to avoid Lexer error
    // https://docs.angularjs.org/error/$parse/lexerr?p0=Unterminated
    items.getProductsMeta = function() {
        return items.ProductsMeta;
    };
    items.getProductIcon = function(productId) {
        return items.ProductsIcons[productId];
    };
    
    items.editItem = function(productId) {
        $state.go('admin.submit', {productId: productId})
    };
    
    
    
    items.formatTimestamp = function(timestamp) {
        return Utils.formatTimestamp(timestamp);
    };
    
    items.goTo = function(nextState) {
        $state.go(nextState);  
    };
    
    
})




