

const myButton = document.getElementById('seed_button');
const output = document.getElementById('output');

myButton.addEventListener('click', async () => {
        
        alert('You clicked the button!');
        const res = await fetch("api/reseed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);

    });


// fetch('/seed')
//   .then(res => res.json())
//   .then(data => console.log(data));