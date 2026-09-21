
from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..database import get_db
from ..auth import require_admin
from ..dijkstra import dijkstra, all_distances
from ..sample_data import sample_train_graph, estimated_time, city_list

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def dashboard(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "message": f"Welcome, {admin.username}",
        "total_users": len(crud.list_users(db)),
        "total_trains": len(crud.list_trains(db)),
        "total_tickets": len(crud.list_all_tickets(db)),
    }


@router.get("/users", response_model=List[schemas.UserAdminOut])
def view_users(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    
    return crud.list_users(db)


@router.get("/tickets", response_model=List[schemas.TicketOut])
def view_all_tickets(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    return crud.list_all_tickets(db)


@router.get("/tickets/export.csv")
def export_all_tickets_csv(admin: models.User = Depends(require_admin),
                           db: Session = Depends(get_db)):
    """Download every booking as a CSV file, tracked by user ID."""
    tickets = crud.list_all_tickets(db)
    username_by_id = {u.user_id: u.username for u in crud.list_users(db)}
    csv_text = crud.tickets_to_csv(tickets, username_by_id)
    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=all_bookings.csv"},
    )


@router.get("/cities")
def cities(admin: models.User = Depends(require_admin)):
    return {"cities": city_list()}


@router.post("/shortest-route", response_model=schemas.RouteResult)
def shortest_route(req: schemas.RouteRequest, admin: models.User = Depends(require_admin)):
    graph = sample_train_graph()
    cost, path = dijkstra(graph, req.source, req.destination)

    if cost == float("inf") or not path:
        
        return schemas.RouteResult(
            source=req.source, destination=req.destination,
            path=[], total_distance=0.0, estimated_time=0.0, hops=[],
        )

    hops = []
    for i in range(len(path) - 1):
        frm, to = path[i], path[i + 1]
        hops.append(schemas.RouteHop(frm=frm, to=to, distance=graph[frm][to]))

    return schemas.RouteResult(
        source=req.source,
        destination=req.destination,
        path=path,
        total_distance=round(cost, 2),
        estimated_time=estimated_time(cost),
        hops=hops,
    )


@router.get("/optimization-chart")
def optimization_chart(source: str, admin: models.User = Depends(require_admin)):
    """Data for the green-on-black scatter/line graph: distance & time from `source`
    to every other reachable city."""
    graph = sample_train_graph()
    dist = all_distances(graph, source)
    points = []
    for city, d in sorted(dist.items(), key=lambda kv: kv[1]):
        if city == source or d == float("inf"):
            continue
        points.append({
            "city": city,
            "distance": round(d, 1),
            "time": estimated_time(d),
        })
    return {"source": source, "points": points}