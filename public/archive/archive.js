document.addEventListener('DOMContentLoaded', fetchArchiveData);

function fetchArchiveData() {
    fetch('/api/archive')
        .then(response => response.json())
        .then(data => {
            const dataList = document.getElementById('data-list');
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'data-item';
                div.addEventListener('mouseover', function() {
                    this.style.transform = 'scale(1.05)';
                });
                div.addEventListener('mouseout', function() {
                    this.style.transform = 'scale(1)';
                });
                div.addEventListener('click', function() {
                    const overlay = document.createElement('div');
                    overlay.style.position = 'fixed'; // Position the overlay on top
                    overlay.style.top = '50%';
                    overlay.style.left = '50%';
                    overlay.style.transform = 'translate(-50%, -50%)'; // Center the overlay without scaling
                    overlay.style.width = '80%'; // Set width to 80% of the screen
                    overlay.style.height = '80%'; // Set height automatically
                    overlay.style.backgroundColor = '#f0f0f0'; // Set background color to #f0f0f0
                    overlay.style.borderRadius = '10px'; // Set border radius to 10px
                    overlay.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; // Set box shadow
                    overlay.style.textAlign = 'center'; // Set text align to center
                    overlay.style.padding = '20px'; // Set padding to 20px
                    overlay.style.opacity = '0'; // Initially set opacity to 0 for animation
                    overlay.style.transition = 'opacity 0.5s'; // Smooth transition for opacity
                    document.body.appendChild(overlay);

                    setTimeout(() => {
                        overlay.style.opacity = '1'; // After a short delay, set opacity to 1 to make it visible
                    }, 10);

                    overlay.innerHTML = `
                        <h2 style="font-size: 1.2em;">${item.alias}, ${item.occupation}</h2>
                        ${item.personal_website ? `<a href="${item.personal_website}" target="_blank" style="text-decoration: none; color: #4CAF50;">Personal Website</a><br>` : ''}
                        ${item.shortage_meaning ? `<h3 style="font-size: 1.1em;">Shortage is ...</h3>  ${item.shortage_meaning}<br>` : ''}
                        ${item.chip_shortage_story ? `<h3 style="font-size: 1.1em;">Story of Chip Shortage</h3> ${item.chip_shortage_story}<br>` : ''}
                        ${item.work_affected_story ? `<h3 style="font-size: 1.1em;">How it affected the practice</h3> ${item.work_affected_story}` : ''}
                    `;

                    overlay.addEventListener('click', function(e) {
                        if (e.target === this) {
                            overlay.style.opacity = '0'; // Set opacity back to 0 to make it disappear
                            setTimeout(() => {
                                this.remove(); // Remove the overlay after the animation
                            }, 500);
                        }
                    });
                });
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = new Date(item.timestamp).toLocaleString();
                const aliasOccupation = document.createElement('div');
                aliasOccupation.textContent = `${item.alias}, ${item.occupation}`;
                const shortageMeaning = document.createElement('div');
                shortageMeaning.textContent = `${item.shortage_meaning}`;
                
                div.appendChild(timestamp);
                div.appendChild(aliasOccupation);
                div.appendChild(shortageMeaning);
                dataList.appendChild(div);
            });
        })
        .catch(error => console.error('Error:', error));
} 