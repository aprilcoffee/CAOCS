document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaireForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {};
        const textareas = this.getElementsByTagName('textarea');
        let allFilled = true;
        for (let i = 0; i < textareas.length; i++) {
            const question = textareas[i].getAttribute('name');
            const value = textareas[i].value;
            if (question === 'name' && value === '') {
                formData[question] = 'Anonymous';
            } else if (question !== 'personal_website' && value === '') {
                allFilled = false;
                break;
            } else {
                formData[question] = value;
            }
        }
        
        if (!allFilled) {
            alert('Please fill in all the questions before submitting.');
            return;
        }
        
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.text())
        .then(result => {
            console.log('Success:', result);
            // Clear all inputs
            Array.from(textareas).forEach(textarea => textarea.value = '');
            // Show a small response after the submit
            alert('Thank you for your submission!');
            // Send back to front page
            window.location.href = "/";
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
