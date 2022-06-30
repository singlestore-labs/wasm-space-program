use crate::command::Direction;

#[derive(PartialEq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

impl Point {
    pub fn distance(&self, b: &Point) -> f32 {
        (((self.x - b.x).pow(2) + (self.y - b.y).pow(2)) as f32).sqrt()
    }

    pub fn sub(&self, b: &Point) -> Point {
        Point {
            x: self.x - b.x,
            y: self.y - b.y,
        }
    }

    pub fn direction_and_distance(&self, end: &Point) -> (Direction, u8) {
        let d = end.sub(self);
        if d.x.abs() > d.y.abs() {
            if d.x > 0 {
                (Direction::East, d.x.abs() as u8)
            } else {
                (Direction::West, d.x.abs() as u8)
            }
        } else if d.y > 0 {
            (Direction::South, d.y.abs() as u8)
        } else {
            (Direction::North, d.y.abs() as u8)
        }
    }
}
