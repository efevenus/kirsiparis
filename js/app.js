/**
 * Ionic Shop (Advanced Edition)
 *
 * @version: v3.0
 * @date: 2016-04-19
 * @author: Noodlio <noodlio@seipel-ibisevic.com>
 * @website: www.noodl.io
 *
 * No changes have been made in V3.0 in the Admin panel
*/

// !important settings
// Please fill in the following constants to get the project up and running
//
var FBURL           = '<YOUR-FB-URL>';
var LIMITVALUE      = 10000000;

angular.module('noodlio', [
  'ui.router',
  'firebase',
  'naif.base64',
  'btford.markdown',
  'noodlio.controllers-account',
  'noodlio.controllers-home',
  'noodlio.controllers-categories',
  'noodlio.controllers-settings-fees',
  'noodlio.controllers-items',
  'noodlio.controllers-sales',
  'noodlio.controllers-navbar',
  'noodlio.controllers-submit',
  'noodlio.services-auth',
  'noodlio.services-categories',
  'noodlio.services-settings',
  'noodlio.services-products',
  'noodlio.services-orders',
  'noodlio.services-utils',
  ]
)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    //$locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
    $urlRouterProvider.otherwise('/admin/home');
    $stateProvider

    // abstract state in the form of a navbar
    .state('admin', {
        url: '/admin',
        templateUrl: '/templates/navbar.html',
        abstract: true,
        controller:'NavBarCtrl as navbar',
    })

    // home
    .state('admin.home', {
        url: '/home',
        templateUrl: '/templates/home.html',
        controller:'HomeCtrl as home',

    })

    .state('admin.categories', {
        url: '/categories',
        templateUrl: '/templates/categories.html',
        controller:'CategoriesCtrl as categories',
    })

    .state('admin.settings-fees', {
        url: '/settings/fees',
        templateUrl: '/templates/settings-fees.html',
        controller:'SettingsFeesCtrl as settings',
    })

    .state('admin.login', {
        url: '/login',
        templateUrl: '/templates/login.html',
        controller:'AccountCtrl as account',
    })

    .state('admin.items', {
        url: '/items',
        templateUrl: '/templates/items.html',
        controller:'ItemsCtrl as items',
    })

    .state('admin.sales', {
        url: '/sales',
        templateUrl: '/templates/sales.html',
        controller:'SalesCtrl as sales',
    })
    .state('admin.sales-detail', {
        url: '/sales/:index/:orderId',
        templateUrl: '/templates/sales-detail.html',
        controller:'SalesDetailCtrl as sdetail',
    })

    .state('admin.submit', {
        url: '/submit/:productId',
        templateUrl: '/templates/submit.html',
        controller:'SubmitCtrl as submit',
    })


    /**



    .state('admin.featured', {
        url: '/featured',
        templateUrl: '/templates/featured.html',
        controller:'ItemsCtrl as items',
    })

    .state('admin.personal', {
        url: '/personal',
        templateUrl: '/templates/personal.html',
        controller:'PersonalCtrl as personal',
    })
    */

})



.directive('itemCols', function() {
  return {
    templateUrl: 'templates/directives/item-cols.html'
  };
})

.directive('attributeSettings', function() {
  return {
    templateUrl: 'templates/directives/attribute-settings.html'
  };
})

.directive('checkoutCartOverview', function() {
  return {
    templateUrl: 'templates/directives/checkout-cart-overview.html'
  };
})
