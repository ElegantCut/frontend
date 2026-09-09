import React from 'react';

const TestTab = ({ name }) => {
    console.log(`✅ ${name} component is rendering!`);

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '10px' }}>
            <h1 style={{ color: 'green' }}>✅ {name} Tab is Working!</h1>
            <p>If you can see this, the Outlet is rendering correctly.</p>
            <p>Current time: {new Date().toLocaleTimeString()}</p>
        </div>
    );
};

export default TestTab;
