(function () {
	const app = {
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

		detectDevice() {
			const ua = navigator.userAgent || navigator.vendor || window.opera;
			const mobileRegex = /android|iphone|ipad|ipod|blackberry|windows phone/i;
			app.isMobile = mobileRegex.test(ua);

			if (app.isMobile) {
				app.isTouch = true;
				document.body.classList.add('touch');
			} else {
				document.body.classList.add('no-touch');
			}
		},

		detectCulture() {
			if (document.body?.classList?.contains('ar')) {
				app.culture = 'ar';
			}
		},

		windowResize() {
			app.windowHeight = window.innerHeight;
			app.windowWidth = window.innerWidth;
			const spacer = document.querySelector('.swiper-spacer');
			if (!spacer) return;

			const slides = document.querySelectorAll('.spotlight__slide.swiper-slide');
			if (slides?.length > 0) {
				slides.forEach(el => {
					el.style.height = `${spacer.offsetHeight}px`;
				});
			}
		},

		resizeListener() {
			if (!app.isMobile) {
				window.addEventListener('resize', () => {
					clearTimeout(app.resizeTimeoutID);
					app.resizeTimeoutID = setTimeout(app.windowResize, 500);
				});
			} else {
				window.addEventListener('orientationchange', app.windowResize);
			}
		},

		addEventListeners() {
			// Extendable
		},

		login() {
			const loginForm = document.getElementById('loginForm');
			const errorMessage = document.getElementById('errorMessage');

			if (!loginForm) return;

			loginForm.addEventListener('submit', function (e) {
				e.preventDefault();

				const username = document.getElementById('username')?.value;
				const password = document.getElementById('password')?.value;

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

		dashboard() {
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

			const requestChartID = document.getElementById('requestChart');
			if (requestChartID) {
				const requestCtx = requestChartID.getContext?.('2d');
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

			const reviewChartID = document.getElementById('reviewChart');
			if (reviewChartID) {
				const reviewCtx = reviewChartID.getContext?.('2d');
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

			const requestStatusChartEl = document.getElementById('requestStatusChart');
			if (requestStatusChartEl) {
				const requestStatusCtx = requestStatusChartEl.getContext?.('2d');
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

			const reviewStatusChartEl = document.getElementById('reviewStatusChart');
			if (reviewStatusChartEl) {
				const reviewStatusCtx = reviewStatusChartEl.getContext?.('2d');
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

		userDropDown() {
			const adminMenuButton = document.getElementById('admin-menu-button');
			const adminDropdownMenu = document.getElementById('admin-dropdown-menu');
			const adminLogout = document.getElementById('admin-logout');

			if (adminMenuButton && adminDropdownMenu && adminLogout) {
				adminMenuButton.addEventListener('click', () => {
					const isExpanded = adminMenuButton.getAttribute('aria-expanded') === 'true';
					adminMenuButton.setAttribute('aria-expanded', !isExpanded);
					adminDropdownMenu.classList.toggle('hidden');
				});

				document.addEventListener('click', (e) => {
					if (!adminMenuButton.contains(e.target) && !adminDropdownMenu.contains(e.target)) {
						adminMenuButton.setAttribute('aria-expanded', 'false');
						adminDropdownMenu.classList.add('hidden');
					}
				});

				adminLogout.addEventListener('click', (e) => {
					e.preventDefault();
					localStorage.removeItem('isLoggedIn');
					localStorage.removeItem('isAdmin');
					window.location.href = 'Login.html';
				});
			}

			const userMenuButton = document.getElementById('user-menu-button');
			const userDropdownMenu = document.getElementById('user-dropdown-menu');
			const userLogout = document.getElementById('user-logout');

			if (userMenuButton && userDropdownMenu && userLogout) {
				userMenuButton.addEventListener('click', () => {
					const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
					userMenuButton.setAttribute('aria-expanded', !isExpanded);
					userDropdownMenu.classList.toggle('hidden');
				});

				document.addEventListener('click', (e) => {
					if (!userMenuButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
						userMenuButton.setAttribute('aria-expanded', 'false');
						userDropdownMenu.classList.add('hidden');
					}
				});

				userLogout.addEventListener('click', (e) => {
					e.preventDefault();
					localStorage.removeItem('isLoggedIn');
					window.location.href = 'Login.html';
				});
			}
		},

		userManagement() {
			// Toggle sidebar on mobile
			const sidebarToggle = document.getElementById('sidebar-toggle');
			const sidebar = document.querySelector('.sidebar');
			const contentArea = document.querySelector('.content-area');

			if (sidebarToggle && sidebar && contentArea) {
				sidebarToggle.addEventListener('click', function () {
					sidebar.classList.toggle('active');
					contentArea.classList.toggle('active');
				});
			}

			// Edit User Modal
			const editButtons = document.querySelectorAll('.edit-user');
			const editModal = document.getElementById('edit-user-modal');
			const cancelEdit = document.getElementById('cancel-edit');

			if (editButtons.length > 0 && editModal) {
				editButtons.forEach((button) => {
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
			const deleteButtons = document.querySelectorAll('.delete-user');
			const deleteModal = document.getElementById('delete-user-modal');
			const cancelDelete = document.getElementById('cancel-delete');
			const confirmDelete = document.getElementById('confirm-delete');

			if (deleteButtons.length > 0 && deleteModal) {
				deleteButtons.forEach((button) => {
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

		tomSelect() {
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


			document.querySelectorAll('.select-single').forEach((selectEl) => {
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

			const tomSelectElement = document.querySelector('#select-user');
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

		init() {
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

document.addEventListener('DOMContentLoaded', () => {
	window.app?.init?.();
});
