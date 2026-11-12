import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ticketService } from "../../../services/ticketService";
import type { Ticket, TicketInput, TicketStatus } from "../../../types/ticket.types";

export interface BulkStatusInput { ids: string[]; status: TicketStatus }
export interface BulkAssignmentInput { ids: string[]; assignedTo: string }

const baseQuery = fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL || "/api" });
const apiError = (error: unknown) => ({
  status: "CUSTOM_ERROR" as const,
  error: error instanceof Error ? error.message : "The ticket operation failed."
});

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery,
  tagTypes: ["Ticket", "TicketList"],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      queryFn: async () => {
        try { return { data: await ticketService.getAll() }; }
        catch (error) { return { error: apiError(error) }; }
      },
      providesTags: (result) => [
        { type: "TicketList", id: "LIST" },
        ...(result ?? []).map(({ id }) => ({ type: "Ticket" as const, id }))
      ]
    }),
    getTicket: builder.query<Ticket, string>({
      queryFn: async (id) => {
        try {
          const ticket = await ticketService.getById(id);
          return ticket ? { data: ticket } : { error: apiError(new Error("Ticket not found.")) };
        } catch (error) { return { error: apiError(error) }; }
      },
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }]
    }),
    createTicket: builder.mutation<Ticket, TicketInput>({
      queryFn: async (input) => {
        try { return { data: await ticketService.create(input) }; }
        catch (error) { return { error: apiError(error) }; }
      },
      invalidatesTags: [{ type: "TicketList", id: "LIST" }]
    }),
    updateTicket: builder.mutation<Ticket, { id: string; input: TicketInput }>({
      queryFn: async ({ id, input }) => {
        try { return { data: await ticketService.update(id, input) }; }
        catch (error) { return { error: apiError(error) }; }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }, { type: "TicketList", id: "LIST" }]
    }),
    deleteTicket: builder.mutation<string, string>({
      queryFn: async (id) => {
        try { await ticketService.remove(id); return { data: id }; }
        catch (error) { return { error: apiError(error) }; }
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Ticket", id }, { type: "TicketList", id: "LIST" }]
    }),
    bulkUpdateStatus: builder.mutation<Ticket[], BulkStatusInput>({
      queryFn: async ({ ids, status }) => {
        try { return { data: await ticketService.bulkUpdateStatus(ids, status) }; }
        catch (error) { return { error: apiError(error) }; }
      },
      async onQueryStarted({ ids, status }, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(ticketApi.util.updateQueryData("getTickets", undefined, (draft) => {
            draft.forEach((ticket) => { if (ids.includes(ticket.id)) ticket.status = status; });
          })),
          ...ids.map((id) => dispatch(ticketApi.util.updateQueryData("getTicket", id, (draft) => { draft.status = status; })))
        ];
        try { await queryFulfilled; }
        catch { patches.forEach((patch) => patch.undo()); }
      },
      invalidatesTags: (_result, _error, { ids }) => [
        { type: "TicketList", id: "LIST" }, ...ids.map((id) => ({ type: "Ticket" as const, id }))
      ]
    }),
    bulkAssignTickets: builder.mutation<Ticket[], BulkAssignmentInput>({
      queryFn: async ({ ids, assignedTo }) => {
        try { return { data: await ticketService.bulkAssign(ids, assignedTo) }; }
        catch (error) { return { error: apiError(error) }; }
      },
      invalidatesTags: (_result, _error, { ids }) => [
        { type: "TicketList", id: "LIST" }, ...ids.map((id) => ({ type: "Ticket" as const, id }))
      ]
    })
  })
});

export const {
  useGetTicketsQuery, useGetTicketQuery, useCreateTicketMutation,
  useUpdateTicketMutation, useDeleteTicketMutation,
  useBulkUpdateStatusMutation, useBulkAssignTicketsMutation
} = ticketApi;
