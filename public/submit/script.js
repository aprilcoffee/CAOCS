document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaireForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {};
        const textareas = this.getElementsByTagName('textarea');
        
        // Just collect the data
        Array.from(textareas).forEach(textarea => {
            const question = textarea.getAttribute('name');
            const value = textarea.value.trim();
            formData[question] = value;
        });

        // Submit to server for validation and processing
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Array.from(textareas).forEach(textarea => textarea.value = '');
                alert('Thank you for your submission!');
                window.location.href = "/";
            } else {
                alert(result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your form. Please try again.');
        });
    });
});
