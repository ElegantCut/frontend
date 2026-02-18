// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll('.sidebar-menu a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and contents
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // Service Modal
    const addServiceBtn = document.getElementById('addServiceBtn');
    const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
    
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            serviceModal.show();
        });
    }

    // Sample data initialization
    initializeSampleData();
});

// Initialize sample data for demonstration
function initializeSampleData() {
    // This would typically come from an API
    console.log('Initializing admin dashboard...');
}

// Form validation for service creation
function validateServiceForm(formData) {
    const errors = [];
    
    if (!formData.name.trim()) {
        errors.push('El nombre del servicio es requerido');
    }
    
    if (!formData.duration || formData.duration <= 0) {
        errors.push('La duración debe ser mayor a 0');
    }
    
    if (!formData.price || formData.price <= 0) {
        errors.push('El precio debe ser mayor a 0');
    }
    
    return errors;
}

// Utility function for API calls (placeholder)
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`/api/${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}