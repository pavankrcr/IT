const request = require('supertest');
const app = require('../app');

describe('POST /submit', () => {
  it('should submit the form successfully', async () => {
    const response = await request(app)
      .post('/submit')
      .field('name', 'John Doe')
      .field('email', 'john.doe@example.com')
      .attach('pdf', 'test/test.pdf');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Form submitted successfully!');
  });

  it('should handle missing name and email', async () => {
    const response = await request(app)
      .post('/submit')
      .field('email', 'john.doe@example.com')
      .attach('pdf', 'test/test.pdf');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Name and Email are required');
  });
});
