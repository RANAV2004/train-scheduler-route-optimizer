
import csv
import os
from typing import Dict


_EDGES = [
    ("Delhi", "Jaipur", 280),
    ("Delhi", "Lucknow", 555),
    ("Delhi", "Ahmedabad", 940),
    ("Jaipur", "Ahmedabad", 675),
    ("Jaipur", "Mumbai", 1150),
    ("Lucknow", "Kolkata", 985),
    ("Lucknow", "Patna", 530),
    ("Patna", "Kolkata", 585),
    ("Ahmedabad", "Mumbai", 525),
    ("Mumbai", "Pune", 150),
    ("Mumbai", "Hyderabad", 710),
    ("Pune", "Hyderabad", 560),
    ("Hyderabad", "Bangalore", 570),
    ("Hyderabad", "Chennai", 625),
    ("Bangalore", "Chennai", 350),
    ("Chennai", "Kolkata", 1670),
    ("Bangalore", "Pune", 840),
]


_AVG_SPEED_KMPH = 65.0


def sample_train_graph() -> Dict[str, Dict[str, float]]:
    """Return the undirected weighted city graph as an adjacency dict."""
    graph: Dict[str, Dict[str, float]] = {}
    for a, b, dist in _EDGES:
        graph.setdefault(a, {})[b] = float(dist)
        graph.setdefault(b, {})[a] = float(dist)
    return graph


def city_list():
    """Sorted list of all cities in the network."""
    return sorted(sample_train_graph().keys())


def estimated_time(distance_km: float) -> float:
    """Rough travel time in hours for a given distance."""
    return round(distance_km / _AVG_SPEED_KMPH, 2)



SAMPLE_TRAINS = [
    
    (12951, "Rajdhani Express", "Delhi", "Mumbai", "16:25", "08:15", 150, 2150),
    (12009, "Shatabdi Express", "Delhi", "Jaipur", "06:05", "10:30", 120, 780),
    (12303, "Poorva Express", "Delhi", "Kolkata", "17:00", "12:40", 140, 1650),
    (12621, "Tamil Nadu Express", "Delhi", "Chennai", "22:30", "07:15", 160, 2100),
    (12123, "Deccan Queen", "Mumbai", "Pune", "17:10", "20:25", 110, 320),
    (12723, "Telangana Express", "Hyderabad", "Delhi", "06:30", "06:45", 150, 1980),
    (12608, "Lalbagh Express", "Bangalore", "Chennai", "06:20", "11:35", 130, 480),
    (12701, "Hussainsagar Express", "Mumbai", "Hyderabad", "21:45", "12:30", 140, 990),
    (12009, "Ahmedabad Shatabdi", "Mumbai", "Ahmedabad", "14:25", "21:10", 120, 860),
    (12333, "Vibhuti Express", "Lucknow", "Kolkata", "20:00", "11:20", 150, 1240),
]


def seed_database(db, models):
    """Populate trains and routes tables if they are empty.

    `db` is a SQLAlchemy session, `models` the models module (passed in to avoid
    a circular import).
    """
  
    if db.query(models.Train).count() == 0:
        seen = set()
        for (num, name, src, dst, dep, arr, seats, fare) in SAMPLE_TRAINS:
            if num in seen:                      
                num = max(t[0] for t in SAMPLE_TRAINS) + len(seen)
            seen.add(num)
            db.add(models.Train(
                train_number=num, train_name=name, source=src, destination=dst,
                departure=dep, arrival=arr, total_seats=seats,
                available_seats=seats, fare=float(fare),
            ))

    
    if db.query(models.Route).count() == 0:
        for a, b, dist in _EDGES:
            for s, d in ((a, b), (b, a)):
                db.add(models.Route(
                    source=s, destination=d,
                    distance=float(dist), estimated_time=estimated_time(dist),
                ))
    db.commit()


def export_routes_csv(path: str = "routes.csv"):
    """Write the route table to a CSV file (parity with the report's CSV story)."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["source", "destination", "distance_km", "estimated_time_h"])
        for a, b, dist in _EDGES:
            writer.writerow([a, b, dist, estimated_time(dist)])
    return os.path.abspath(path)
