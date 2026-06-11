/**
 * @swagger
 * /api/ping:
 *   get:
 *     summary: Ping check
 *     description: Simple connectivity check that returns plain text "pong"
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is reachable
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: pong
 *
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns server health status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Database unreachable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

module.exports = {};
