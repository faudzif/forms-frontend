"use strict";

(function () {
  var app = {
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    isMobile: false,
    isTouch: false,
    resizeTimeoutID: null,
    culture: 'en',
    isIe: false,
    responsiveBreakpointValue: '(max-width: 1200px)',
    responsiveBreakpointBoolean: false,
    hamburgerBoolean: false,
    hamburgerBoolean2: false,
    successSwiper: false,
    tabSwiper: null,
    disableAnimation: false,
    lifestyleSwiper: null,
    markersArray: [],
    tabsList: document.querySelector(".tabs-list"),
    detectDevice: function detectDevice() {
      var ua = navigator.userAgent || navigator.vendor || window.opera;
      var mobileRegex = /android|iphone|ipad|ipod|blackberry|windows phone/i;
      app.isMobile = mobileRegex.test(ua);
      if (app.isMobile) {
        app.isTouch = true;
        document.body.classList.add('touch');
      } else {
        document.body.classList.add('no-touch');
      }
    },
    detectCulture: function detectCulture() {
      var _document$body;
      if ((_document$body = document.body) !== null && _document$body !== void 0 && (_document$body = _document$body.classList) !== null && _document$body !== void 0 && _document$body.contains('ar')) {
        app.culture = 'ar';
      }
    },
    windowResize: function windowResize() {
      app.windowHeight = window.innerHeight;
      app.windowWidth = window.innerWidth;
      var spacer = document.querySelector('.swiper-spacer');
      if (!spacer) return;
      var slides = document.querySelectorAll('.spotlight__slide.swiper-slide');
      if ((slides === null || slides === void 0 ? void 0 : slides.length) > 0) {
        slides.forEach(function (el) {
          el.style.height = "".concat(spacer.offsetHeight, "px");
        });
      }
    },
    resizeListener: function resizeListener() {
      if (!app.isMobile) {
        window.addEventListener('resize', function () {
          clearTimeout(app.resizeTimeoutID);
          app.resizeTimeoutID = setTimeout(app.windowResize, 500);
        });
      } else {
        window.addEventListener('orientationchange', app.windowResize);
      }
    },
    addEventListeners: function addEventListeners() {
      // Extendable
    },
    login: function login() {
      var loginForm = document.getElementById('loginForm');
      var errorMessage = document.getElementById('errorMessage');
      if (!loginForm) return;
      loginForm.addEventListener('submit', function (e) {
        var _document$getElementB, _document$getElementB2;
        e.preventDefault();
        var username = (_document$getElementB = document.getElementById('username')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value;
        var password = (_document$getElementB2 = document.getElementById('password')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value;
        if (!username || !password) {
          if (errorMessage) {
            errorMessage.textContent = 'Please enter username and password';
            errorMessage.classList.remove('hidden');
          }
          return;
        }
        if (username === 'admin' && password === 'qwerty') {
          localStorage.setItem('isLoggedIn', 'true');
          window.location.href = 'users.html';
        } else if (username === 'requester' && password === 'qwerty') {
          localStorage.setItem('isLoggedIn', 'true');
          window.location.href = 'dashboard-requester.html';
        } else if (username === 'reviewer' && password === 'qwerty') {
          localStorage.setItem('isLoggedIn', 'true');
          window.location.href = 'dashboard-reviewer.html';
        } else {
          if (errorMessage) {
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.classList.remove('hidden');
          }
        }
      });
    },
    dashboard: function dashboard() {
      /* debugger
      if (localStorage.getItem('isLoggedIn') !== 'true') {
      	window.location.href = 'login.html';
      }
      		const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
      	logoutBtn.addEventListener('click', function () {
      		localStorage.removeItem('isLoggedIn');
      		window.location.href = 'index.html';
      	});
      } */

      var requestChartID = document.getElementById('requestChart');
      if (requestChartID) {
        var _requestChartID$getCo;
        var requestCtx = (_requestChartID$getCo = requestChartID.getContext) === null || _requestChartID$getCo === void 0 ? void 0 : _requestChartID$getCo.call(requestChartID, '2d');
        if (requestCtx) {
          new Chart(requestCtx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Year 2025',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: '#0c7560',
                borderColor: '#1D4ED8',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
      var reviewChartID = document.getElementById('reviewChart');
      if (reviewChartID) {
        var _reviewChartID$getCon;
        var reviewCtx = (_reviewChartID$getCon = reviewChartID.getContext) === null || _reviewChartID$getCon === void 0 ? void 0 : _reviewChartID$getCon.call(reviewChartID, '2d');
        if (reviewCtx) {
          new Chart(reviewCtx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Year 2025',
                data: [4, 1, 3, 9, 6, 11],
                backgroundColor: '#0c7560',
                borderColor: '#1D4ED8',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
      var requestStatusChartEl = document.getElementById('requestStatusChart');
      if (requestStatusChartEl) {
        var _requestStatusChartEl;
        var requestStatusCtx = (_requestStatusChartEl = requestStatusChartEl.getContext) === null || _requestStatusChartEl === void 0 ? void 0 : _requestStatusChartEl.call(requestStatusChartEl, '2d');
        if (requestStatusCtx) {
          new Chart(requestStatusCtx, {
            type: 'doughnut',
            data: {
              labels: ['Rejected', 'Pending', 'In Progress', 'Completed'],
              datasets: [{
                data: [300, 150, 100, 200],
                backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#0c7560'],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        }
      }
      var reviewStatusChartEl = document.getElementById('reviewStatusChart');
      if (reviewStatusChartEl) {
        var _reviewStatusChartEl$;
        var reviewStatusCtx = (_reviewStatusChartEl$ = reviewStatusChartEl.getContext) === null || _reviewStatusChartEl$ === void 0 ? void 0 : _reviewStatusChartEl$.call(reviewStatusChartEl, '2d');
        if (reviewStatusCtx) {
          new Chart(reviewStatusCtx, {
            type: 'doughnut',
            data: {
              labels: ['Rejected', 'Pending', 'In Progress', 'Completed'],
              datasets: [{
                data: [150, 20, 40, 150],
                backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#0c7560'],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        }
      }
    },
    userDropDown: function userDropDown() {
      var adminMenuButton = document.getElementById('admin-menu-button');
      var adminDropdownMenu = document.getElementById('admin-dropdown-menu');
      var adminLogout = document.getElementById('admin-logout');
      if (adminMenuButton && adminDropdownMenu && adminLogout) {
        adminMenuButton.addEventListener('click', function () {
          var isExpanded = adminMenuButton.getAttribute('aria-expanded') === 'true';
          adminMenuButton.setAttribute('aria-expanded', !isExpanded);
          adminDropdownMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function (e) {
          if (!adminMenuButton.contains(e.target) && !adminDropdownMenu.contains(e.target)) {
            adminMenuButton.setAttribute('aria-expanded', 'false');
            adminDropdownMenu.classList.add('hidden');
          }
        });
        adminLogout.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          window.location.href = 'Login.html';
        });
      }
      var userMenuButton = document.getElementById('user-menu-button');
      var userDropdownMenu = document.getElementById('user-dropdown-menu');
      var userLogout = document.getElementById('user-logout');
      if (userMenuButton && userDropdownMenu && userLogout) {
        userMenuButton.addEventListener('click', function () {
          var isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
          userMenuButton.setAttribute('aria-expanded', !isExpanded);
          userDropdownMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function (e) {
          if (!userMenuButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userMenuButton.setAttribute('aria-expanded', 'false');
            userDropdownMenu.classList.add('hidden');
          }
        });
        userLogout.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('isLoggedIn');
          window.location.href = 'Login.html';
        });
      }
    },
    userManagement: function userManagement() {
      // Toggle sidebar on mobile
      var sidebarToggle = document.getElementById('sidebar-toggle');
      var sidebar = document.querySelector('.sidebar');
      var contentArea = document.querySelector('.content-area');
      if (sidebarToggle && sidebar && contentArea) {
        sidebarToggle.addEventListener('click', function () {
          sidebar.classList.toggle('active');
          contentArea.classList.toggle('active');
        });
      }

      // Edit User Modal
      var editButtons = document.querySelectorAll('.edit-user');
      var editModal = document.getElementById('edit-user-modal');
      var cancelEdit = document.getElementById('cancel-edit');
      if (editButtons.length > 0 && editModal) {
        editButtons.forEach(function (button) {
          button.addEventListener('click', function () {
            editModal.classList.remove('hidden');
          });
        });
      }
      if (cancelEdit && editModal) {
        cancelEdit.addEventListener('click', function () {
          editModal.classList.add('hidden');
        });
      }

      // Delete User Modal
      var deleteButtons = document.querySelectorAll('.delete-user');
      var deleteModal = document.getElementById('delete-user-modal');
      var cancelDelete = document.getElementById('cancel-delete');
      var confirmDelete = document.getElementById('confirm-delete');
      if (deleteButtons.length > 0 && deleteModal) {
        deleteButtons.forEach(function (button) {
          button.addEventListener('click', function () {
            deleteModal.classList.remove('hidden');
          });
        });
      }
      if (cancelDelete && deleteModal) {
        cancelDelete.addEventListener('click', function () {
          deleteModal.classList.add('hidden');
        });
      }
      if (confirmDelete && deleteModal) {
        confirmDelete.addEventListener('click', function () {
          alert('User deleted successfully!');
          deleteModal.classList.add('hidden');
        });
      }

      // Close modals when clicking outside
      if (editModal || deleteModal) {
        window.addEventListener('click', function (event) {
          if (editModal && event.target === editModal) {
            editModal.classList.add('hidden');
          }
          if (deleteModal && event.target === deleteModal) {
            deleteModal.classList.add('hidden');
          }
        });
      }
    },
    tomSelect: function tomSelect() {
      // single item select
      // const singleSelectElement = document.querySelector('.select-single');
      // if (singleSelectElement) {
      // 	new TomSelect(".select-single", {
      // 		maxItems: 1,
      // 		plugins: ['remove_button'],
      // 		create: true,
      // 		sortField: {
      // 			field: "text",
      // 			direction: "asc"
      // 		}
      // 	});
      // }

      document.querySelectorAll('.select-single').forEach(function (selectEl) {
        new TomSelect(selectEl, {
          maxItems: 1,
          plugins: ['remove_button'],
          create: true,
          sortField: {
            field: "text",
            direction: "asc"
          }
        });
      });
      var tomSelectElement = document.querySelector('#select-user');
      if (tomSelectElement) {
        new TomSelect("#select-user", {
          maxItems: 3,
          plugins: ['remove_button'],
          create: true,
          sortField: {
            field: "text",
            direction: "asc"
          }
        });
      }
    },
    init: function init() {
      app.detectCulture();
      app.detectDevice();
      app.resizeListener();
      app.addEventListeners();
      app.login();
      app.dashboard();
      app.userDropDown();
      app.userManagement();
      app.tomSelect();
    }
  };
  window.app = app;
})();
document.addEventListener('DOMContentLoaded', function () {
  var _window$app, _window$app$init;
  (_window$app = window.app) === null || _window$app === void 0 || (_window$app$init = _window$app.init) === null || _window$app$init === void 0 || _window$app$init.call(_window$app);
});
//# sourceMappingURL=default.js.map
