const { initializeDatabase } = require('./index');

initializeDatabase()
	.then(() => {
		console.log('Database migrations executed successfully.');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Database migration failed:', error);
		process.exit(1);
	});
