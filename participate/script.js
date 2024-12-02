document.getElementById('myForm').addEventListener('submit',function(event){
    event.preventDefault();

    // Get values from text boxes
    const textBox1 = document.getElementById('textBox1').value;
    const textBox2 = document.getElementById('textBox2').value;
    const textBox3 = document.getElementById('textBox3').value;

    // Log values to console (for demonstration)
    console.log('Text Box 1:', textBox1);
    console.log('Text Box 2:', textBox2);
    console.log('Text Box 3:', textBox3);

});