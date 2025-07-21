// User Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const userMenuTrigger = document.querySelector('.user-menu-trigger');
        
        if (userMenu && !userMenu.contains(event.target) && !userMenuTrigger.contains(event.target)) {
            userMenu.style.opacity = '0';
            userMenu.style.visibility = 'hidden';
            userMenu.style.transform = 'translateY(10px)';
            
            // Reset after transition
            setTimeout(() => {
                if (!userMenuTrigger.matches(':hover')) {
                    userMenu.style = '';
                }
            }, 300);
        }
    });
});
