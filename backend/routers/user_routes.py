
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/user", tags=["user"])



@router.get("/trains", response_model=List[schemas.TrainOut])
def view_trains(
    source: Optional[str] = None,
    destination: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    if source or destination:
        return crud.search_trains(db, source or "", destination or "")
    return crud.list_trains(db)



@router.post("/tickets", response_model=schemas.TicketOut, status_code=201)
def book_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    train = crud.get_train(db, ticket.train_number)
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    if train.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No seats available on this train")
    return crud.book_ticket(db, current_user.user_id, ticket)



@router.get("/tickets", response_model=List[schemas.TicketOut])
def my_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.list_tickets_for_user(db, current_user.user_id)


@router.get("/tickets/export.csv")
def export_my_tickets_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Download the current user's bookings as a CSV file."""
    tickets = crud.list_tickets_for_user(db, current_user.user_id)
    csv_text = crud.tickets_to_csv(tickets, {current_user.user_id: current_user.username})
    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=my_bookings.csv"},
    )



@router.put("/tickets/{ticket_id}/reschedule", response_model=schemas.TicketOut)
def reschedule(
    ticket_id: int,
    data: schemas.TicketReschedule,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket or ticket.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot reschedule a cancelled ticket")
    return crud.reschedule_ticket(db, ticket, data)



@router.delete("/tickets/{ticket_id}", response_model=schemas.TicketOut)
def cancel(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket or ticket.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return crud.cancel_ticket(db, ticket)