import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../../middleware/auth.middleware.js";

import { tournamentController } from "../controllers/tournament.controller.js";

const router = Router();

/**
 * @openapi
 * /tournament/create:
 *   post:
 *     tags:
 *       - Tournament
 *     summary: Create Tournament
 *     description: Create a tournament. Only ADMIN and ORGANIZER can create tournaments.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *       403:
 *         description: Organizer verification required or forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  "/create",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.create
);

/**
 * @openapi
 * /tournament:
 *   get:
 *     tags:
 *       - Tournament
 *     summary: Get all tournaments
 *     description: Get tournaments with pagination and optional search/filter parameters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament list fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", tournamentController.getAll);

router.get(
  "/my",
  authMiddleware,
  authorize("ORGANIZER", "ADMIN"),
  tournamentController.getMyTournaments
);

/**
 * @openapi
 * /tournament/{id}:
 *   get:
 *     tags:
 *       - Tournament
 *     summary: Get tournament by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament fetched successfully
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/crew-work-opportunities",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER", "ADMIN"),
  tournamentController.getOpenCrewWorkOpportunities
);

router.get(
  "/crew-work-applications/my",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  tournamentController.getMyCrewWorkApplications
);

router.post(
  "/crew-work-opportunities/:opportunityId/apply",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  tournamentController.applyForCrewWorkOpportunity
);

router.get(
  "/crew-work-opportunities/:opportunityId/applications",
  authMiddleware,
  authorize("ORGANIZER", "ADMIN"),
  tournamentController.getCrewWorkApplications
);

router.post(
  "/crew-work-applications/:applicationId/accept",
  authMiddleware,
  authorize("ORGANIZER", "ADMIN"),
  tournamentController.acceptCrewWorkApplication
);

router.post(
  "/:id/crew-work-opportunities",
  authMiddleware,
  authorize("ORGANIZER", "ADMIN"),
  tournamentController.publishCrewWorkOpportunities
);

router.get(
  "/:id/crew-work-opportunities",
  authMiddleware,
  authorize("ORGANIZER", "ADMIN"),
  tournamentController.getCrewWorkOpportunities
);

router.get("/:id", tournamentController.getById);

/**
 * @openapi
 * /tournament/{id}:
 *   patch:
 *     tags:
 *       - Tournament
 *     summary: Update tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/crew-assignments/my",
  authMiddleware,
  tournamentController.getMyCrewAssignments
);

router.post(
  "/:id/crew-requirements",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.createCrewRequirement
);

router.get(
  "/:id/crew-requirements",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.getCrewRequirements
);

router.post(
  "/:id/crew",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.assignCrew
);

router.get(
  "/:id/crew-requirements/:requirementId/candidates",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.findCrewCandidates
);

router.post(
  "/:id/crew-requirements/:requirementId/assign",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.assignCrewToRequirement
);


router.post(
  "/:id/crew-requirements/:requirementId/invite",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.inviteCrew
);

router.get(
  "/:id/crew-invitations",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.getCrewInvitations
);

router.get(
  "/crew-invitations/my",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  tournamentController.getMyCrewInvitations
);

router.post(
  "/crew-invitations/:invitationId/respond",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  tournamentController.respondToCrewInvitation
);

router.get(
  "/:id/crew",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.getCrew
);

router.post(
  "/:id/crew-assignments/:assignmentId/start",
  authMiddleware,
  tournamentController.startCrewWork
);

router.post(
  "/:id/crew-assignments/:assignmentId/complete",
  authMiddleware,
  tournamentController.submitCrewCompletion
);

router.post(
  "/:id/crew-assignments/:assignmentId/verify",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  tournamentController.verifyCrewCompletion
);


router.patch(
  "/:id/approve",
  authMiddleware,
  authorize("ADMIN"),
  tournamentController.approve
);

router.patch(
  "/:id/reject",
  authMiddleware,
  authorize("ADMIN"),
  tournamentController.reject
);

router.patch(
  "/:id",
  authMiddleware,
  tournamentController.update
);

/**
 * @openapi
 * /tournament/{id}:
 *   delete:
 *     tags:
 *       - Tournament
 *     summary: Delete tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authMiddleware,
  tournamentController.remove
);

export default router;
