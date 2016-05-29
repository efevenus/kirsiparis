angular.module('noodlio.controllers-submit', [])

.controller('SubmitCtrl', function(
    $state, $timeout, $location, $anchorScroll, $stateParams,
    Auth, Products, Utils, Categories) {
        
    // controller variables
    var submit = this;
    var currentProductId = null;   
    
    // init variables 
    submit.status = {
        editMode: false,
        submitLoading: false,
        generalView: 'loading',
        containsNoError: true,
        loadingScreenshots: true,
        loadingCategories: true,
    };
    submit.AuthData         = Auth.AuthData;
    submit.Categories       = Categories;
    submit.ProductMeta      = {};
    submit.ProductImages    = {};
    submit.ErrorMessages    = {};
    submit.IndexData        = {};

    // init the dependencies on load
    submit.initView = function() {
        
        currentProductId = $stateParams.productId;
        redirectView();
        loadCategories();
        
        $location.hash('page-top');
        $anchorScroll();
    };
    
    function loadCategories() {
        console.log('load cat')
        Categories.get().then(
            function(success){
                submit.status['loadingCategories'] = false;
                if(submit.Categories.all != null) {
                    submit.Categories = submit.Categories.all;
                }
            },
            function(error){
                console.log(error);
                submit.status['loadingCategories'] = false;
            }
        );
    };
    
    
    /**
     * Edit mode verification and redirection:
     * - is it in the edit mode?
     * - does product excist?
     * - does author have the right to edit?
     * - submit with new productId or existing
     */
    function redirectView() {
        if(submit.AuthData.hasOwnProperty('uid')){
            if(currentProductId != undefined && currentProductId != null && currentProductId != "") {
                // load product
                Products.getProductMeta(currentProductId).then(
                    function(ProductMeta){
                        if(ProductMeta != null) {
                            // validate rights
                            //console.log("EDIT RIGHTS NOT WORKING", ProductMeta.userId, submit.AuthData.uid)
                            if(ProductMeta.userId == submit.AuthData.uid) {
                                submit.ProductMeta = ProductMeta;   // bind the data
                                initEditMode();                     // load images and screenshots
                            } else {
                                initNewSubmission();
                            }
                        } else {
                            currentProductId = null;
                            initNewSubmission();    // technically an error
                        };
                    },
                    function(error){
                        initError();
                    }
                )
            } else {
                initNewSubmission();
            };
        } else {
            initError();
        };
        
        // stateA - new
        function initNewSubmission() {
            
            submit.status["generalView"]    = "new";
            submit.status["editMode"]       = false;
            currentProductId                = null; 
            
            // 
            submit.ProductMeta = {
                userId: submit.AuthData.uid
            };
            
            // 
            submit.IndexData = {
                inventory_nb_items: -1
            };
            
            submit.status['loadingScreenshots'] = false
    
        };
        
        // stateB - edit mode
        function initEditMode() {                       //console.log("edit submission")
            submit.status["generalView"]    = "edit";
            submit.status["editMode"]       = true;
            
            // -->
            console.log(submit.ProductMeta)
            if(submit.ProductMeta.hasOwnProperty('discount_date_end')) {
                submit.ProductMeta["discount_date_end_raw"] = new Date(submit.ProductMeta["discount_date_end"]);
            };
            
            // -->
            getIndexValues()
            
            // -->
            loadScreenshots();
        };
        
        // stateB - something went wrong
        function initError() {
            submit.status["generalView"] = "error";     //console.log("error")
        };
        
    };
    
    // -------------------------------------------------------------------------
    // Load editable data
    function loadScreenshots() {
        // load images
        Products.getProductScreenshots(currentProductId).then(
            function(ScreenshotsData){
                processScreenshotsData(ScreenshotsData);
            },
            function(error){
                //console.log(error);
                submit.status["generalView"] = "error";
            }
        );
    };
    
    // fn index values (inventory_count)
    function getIndexValues() {
        Products.getIndexValues(currentProductId).then(
            function(IndexValues){
                submit.IndexData = IndexValues;
            },
            function(error){
                console.log(error)
            }
        )
    };
    
    
    // -------------------------------------------------------------------------
    submit.simulateSubmit = function() {
        
        submit.ProductMeta = {
            'categoryId': 'first',
            'tagsString': 'semin, test, hello',
            'title': 'Hello world',
            'price': 5,
            'userId': submit.AuthData.uid,
            'discount_date_end_raw': new Date("February 27, 2016 11:13:00"),
            'discount_perc': 50,
        };
        submit.OtherData = {
            'inventory_nb_items': 14
        }
        
        //submit.submitForm();
    };
    
    
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    
    /**
     * Validate and Submit the form with ProductMeta
     */
    submit.status['submitLoading'] = false;
    submit.submitForm = function() {
        
        // prepare
        scrollToSubmitEnd(); 
        
        
        // validate
        if(validateProductMeta()){
            
            // referential
            addReferentialData();
            
            // psubmit
            submit.status['submitLoading']      = true;
            
            switch (submit.status['editMode']) {
                case true:
                    //
                    Products.editProduct(submit.ProductMeta, submit.ProductImages, Auth.AuthData, submit.IndexData, currentProductId).then(
                        function(success){
                            handleSuccess(currentProductId);
                        },
                        function(error){
                            handleError(error)
                        }
                    );
                    break
                case false:
                    //
                    Products.submitProduct(submit.ProductMeta, submit.ProductImages, Auth.AuthData, submit.IndexData).then(
                        function(productId){
                            handleSuccess(productId);
                        },
                        function(error){
                            handleError(error)
                        }
                    );
                    break
            } // ./ switch
            
        };
        
        // fn error
        function handleError(error) {
            submit.status['submitLoading']      = false;
            submit.status['containsNoError']    = false;
            submit.ErrorMessages['general']     = "Ooops Something went wrong... try again or contact us with reference code " + error;
        };
        
        // fn success
        function handleSuccess(productId) {
            submit.status['submitLoading']      = false;
            submit.status['containsNoError']    = false;
            $state.go('admin.items');
        };
        
    };
    
  
    /**
     * Used for filtering
     * *** put this on the SERVER
     */
    function addReferentialData() {
        // server values firebase
        submit.ProductMeta["timestamp_update"] = Firebase.ServerValue.TIMESTAMP;
        if(!submit.ProductMeta.hasOwnProperty('timestamp_creation')) {
            submit.ProductMeta["timestamp_creation"] = Firebase.ServerValue.TIMESTAMP;
        };
        
        // transform to timestamp
        if(submit.ProductMeta["discount_date_end_raw"]) {
            submit.ProductMeta["discount_date_end"] = submit.ProductMeta["discount_date_end_raw"].getTime();
        };
        
        
    };
    

    
    /**
     * 
     * Base 64 File Upload
     * *** Redo to one function
     * 
     */
    submit.dimensions = {
        screenshot: {
            w: 400,
            h: 400
        }
    };

    
    // screenshots
    var ProductImagesArray = [];
    submit.onLoad9 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas9", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                ProductImagesArray.push(resizedBase64);
                transformArrayToScreenshot();
            }, function(error){
                //console.log(error)
            }
        )
    };
    
    submit.removeScreenshot = function(key){
        var index = key.match(/\d+/)[0];
        //console.log('remove', key, index)
        //console.log(ProductImagesArray)
        ProductImagesArray.splice(index-1, 1);
        transformArrayToScreenshot();
    };
    
    // takes ProductImagesArray and sets in ProductsImages  
    function transformArrayToScreenshot() {
      submit.ProductImages = {};
      for (var i = 0; i<ProductImagesArray.length; i++) {
          var iter = i+1;
          submit.ProductImages['screenshot' + iter] = ProductImagesArray[i];
      }
    };
    
    function initProductArray() {
        var iter = 0;
        angular.forEach(submit.ProductImages, function(value, key){
            if(key != 'icon') {
                ProductImagesArray[iter] = value;
                iter = iter+1; 
            }
        })
    };
    
    
    // handling 
    // v2
    function processScreenshotsData(ScreenshotsData) {
        submit.ProductImages = ScreenshotsData;
        initProductArray();
        submit.status['loadingScreenshots'] = false;
    };
    
    
    // -------------------------------------------------------------------------
    // Attributes
    submit.addAttributeType = function() {
        var aType = submit.status.newAttributeType;
        console.log('adding type', aType)
        if(aType) {
            if(submit.ProductMeta.hasOwnProperty('attributes')){
                submit.ProductMeta['attributes'][aType] = {}
            } else {
                var tempObj = {};
                tempObj[submit.status.newAttributeType] = {};
                submit.ProductMeta['attributes'] = tempObj;
            }
        }
        console.log(submit.ProductMeta['attributes'])
    };
    submit.deleteAttributeType = function(aType) {
        delete submit.ProductMeta['attributes'][aType]
    };
    
    submit.addAttributeValue = function() {
        var aValue = submit.status.newAttributeValue;
        var aType = submit.status.selectedAttributeType;
        console.log('adding value', aValue, aType)
        if(aValue && aType) {
            submit.ProductMeta['attributes'][aType][aValue] = true;
        };
    };
    
    submit.deleteAttributeValue = function(aType, aValue) {
        delete submit.ProductMeta['attributes'][aType][aValue];
    };
    
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    
    
    /**
     * Other helpers and buttons
     */
    function scrollToSubmitEnd() {
        $location.hash('submit0');
        $anchorScroll.yOffset = 100;
        $anchorScroll();
    };
    
    // -------------------------------------------------------------------------
    // navigation wise 
    
    submit.goTo = function(nextState) {
        $state.go(nextState);
    };
    
    // -------------------------------------------------------------------------
    // Validate submitform
    
    function validateProductMeta() {
        submit.ErrorMessages = {};
        submit.status['containsNoError'] = true;
        //
        // submission - categoryId
        if(!submit.ProductMeta.hasOwnProperty("categoryId")) {
            submit.ErrorMessages["categoryId"] = 
                "Please select a categoryId";
                submit.status['containsNoError'] = false;
        };
        if( submit.ProductMeta["categoryId"] == "" || 
            submit.ProductMeta["categoryId"] == null ||
            submit.ProductMeta["categoryId"] == undefined) {
            submit.ErrorMessages["categoryId"] = 
                "Please select a categoryId";
                submit.status['containsNoError'] = false;
        };
        //
        // tags string
        if(!submit.ProductMeta.hasOwnProperty("tagsString")) {
            submit.ErrorMessages["tagsString"] = 
                "Add at least one tag. Tags should be seperated by comma";
                submit.status['containsNoError'] = false;
        };
        //
        // product details - title
        if(!submit.ProductMeta.hasOwnProperty("title")) {
            submit.ErrorMessages["title"] = 
                "Title missing";
                submit.status['containsNoError'] = false;
        };
        if( submit.ProductMeta["title"] == "" || 
            submit.ProductMeta["title"] == null ||
            submit.ProductMeta["title"] == undefined) {
            submit.ErrorMessages["title"] = 
                "Title missing";
                submit.status['containsNoError'] = false;
        };
        //
        // product details - price
        if(!submit.ProductMeta.hasOwnProperty("price")) {
            submit.ErrorMessages["price"] = 
                "Price missing";
                submit.status['containsNoError'] = false;
        };
        if( submit.ProductMeta["price"] == "" || 
            submit.ProductMeta["price"] == null ||
            submit.ProductMeta["price"] == undefined) {
            submit.ErrorMessages["price"] = 
                "Price missing";
                submit.status['containsNoError'] = false;
        };
        
        
        
        
        //
        // generic
        if (!submit.status['containsNoError']) {
            submit.status['submitLoading'] = false;
            submit.ErrorMessages['general'] = 
            "There are some errors in your submission. Please check all fields in red";
        };
        
        return submit.status['containsNoError'];
    };
    
    

    
    
    
  
})