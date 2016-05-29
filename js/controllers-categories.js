angular.module('noodlio.controllers-categories', [])


.controller('CategoriesCtrl', function($state, $anchorScroll, $location, Auth, Categories, Utils) {
    
    var categories        = this;
    categories.AuthData   = Auth.AuthData;
    categories.CategoriesForm = Categories.all;
    categories.statusObj = {
        loading: true,
        newCategory: ""
    };
    
    categories.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        loadCategories();
    };
    
    function loadCategories() {
        Categories.get().then(
            function(success){
                categories.statusObj['loading'] = false;
                if(Categories.all != null) {
                    categories.CategoriesForm = Categories.all;
                }
            },
            function(error){
                console.log(error);
                categories.statusObj['loading'] = false;
                categories.statusObj['generalmessage'] = "Something went wrong..."
            }
        );
    };
    
    categories.add = function() {
        console.log('inside')
        console.log(Utils.alphaNumeric(categories.statusObj.newCategory))
        if(categories.statusObj.newCategory) {
            categories.CategoriesForm[Utils.alphaNumeric(categories.statusObj.newCategory)] = {
                title: categories.statusObj.newCategory
            };
            set();
        }
    };
    
    categories.remove = function(key) {
        delete categories.CategoriesForm[key];
        set();
    };
    
    categories.save = function() {
        set();
    };
    
    function set() {
        categories.statusObj['generalmessage'] = "Changing categories..."
        Categories.set(categories.CategoriesForm).then(
            function(success){
                
                categories.statusObj['generalmessage'] = "Success!"
                
            },
            function(error){
                categories.statusObj['generalmessage'] = "Something went wrong..."
                console.log(error);
            }
        )
    };
    
    
    categories.goTo = function(nextState) {
        $state.go(nextState)
    };
    

  
})