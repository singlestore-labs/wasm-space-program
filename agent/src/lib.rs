use bytes_cast::{unaligned, BytesCast};
use std::{fmt::Debug, mem};

wit_bindgen_rust::export!("agent.wit");
struct Agent;
use agent::Entity;

#[derive(BytesCast)]
#[repr(C)]
struct EntityPacked {
    kind: u8,
    danger: u8,
    x: unaligned::U32Ne,
    y: unaligned::U32Ne,
}

impl EntityPacked {
    fn position(&self) -> Point {
        Point {
            x: self.x.get() as i32,
            y: self.y.get() as i32,
        }
    }
}

impl Entity {
    fn position(&self) -> Point {
        Point {
            x: self.x as i32,
            y: self.y as i32,
        }
    }
}

impl agent::Agent for Agent {
    fn pack(e: Entity) -> Vec<u8> {
        EntityPacked {
            kind: e.kind,
            danger: if e.blasters > 5 { 3 } else { 0 },
            x: e.x.into(),
            y: e.y.into(),
        }
        .as_bytes()
        .into()
    }

    fn step(e: Entity, encoded_cell: Vec<u8>) -> u8 {
        let count = encoded_cell.len() / mem::size_of::<EntityPacked>();
        let (cell, rest) = EntityPacked::slice_from_bytes(&encoded_cell, count).unwrap();
        assert_eq!(rest.len(), 0);

        let position = e.position();

        let mut target_distance: f32 = f32::MAX;
        let mut target: Option<Point> = None;

        for n in cell {
            if n.kind == 2 {
                let dist = position.distance(&n.position());
                if dist < target_distance {
                    target_distance = dist;
                    target = Some(n.position());
                }
            }
        }

        let cmd = target
            .map(|t| {
                let (dir, mut dist) = Point::direction_and_distance(&position, &t);
                if dist > 0 {
                    dist = dist.min(e.thrusters);
                    Command::Move(dir, dist)
                } else {
                    Command::Hold
                }
            })
            .unwrap_or(Command::Hold);

        Command::encode(cmd)
    }

    fn decodecmd(m: u8) -> String {
        let cmd = Command::decode(m);
        format!("{:?}", cmd)
    }
}

struct Point {
    x: i32,
    y: i32,
}

impl Point {
    fn distance(&self, b: &Point) -> f32 {
        (((self.x - b.x).pow(2) + (self.y - b.y).pow(2)) as f32).sqrt()
    }

    fn direction_and_distance(start: &Point, end: &Point) -> (Direction, u8) {
        let d = Point::sub(end, start);
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

    fn sub(a: &Point, b: &Point) -> Point {
        Point {
            x: a.x - b.x,
            y: a.y - b.y,
        }
    }
}

#[derive(Debug)]
enum Component {
    Unknown,
    Blasters,
    Thrusters,
    Harvesters,
}

#[derive(Debug)]
enum Direction {
    North,
    East,
    South,
    West,
}

#[derive(Debug)]
enum Command {
    Unknown,
    Hold,
    Move(Direction, u8),
    Upgrade(Component),
}

impl Command {
    const HOLD: u8 = 0;
    const MOVE_N: u8 = 0b001 << 5;
    const MOVE_E: u8 = 0b010 << 5;
    const MOVE_S: u8 = 0b011 << 5;
    const MOVE_W: u8 = 0b100 << 5;
    const UPGRADE: u8 = 0b101 << 5;

    const BLASTERS: u8 = 0b00;
    const THRUSTERS: u8 = 0b01;
    const HARVESTERS: u8 = 0b10;

    const CMD_MASK: u8 = 0b111 << 5;
    const ARG_MASK: u8 = 0b11111;

    fn encode(cmd: Command) -> u8 {
        match cmd {
            Command::Hold => Self::HOLD,
            Command::Move(direction, distance) => {
                (match direction {
                    Direction::North => Self::MOVE_N,
                    Direction::East => Self::MOVE_E,
                    Direction::South => Self::MOVE_S,
                    Direction::West => Self::MOVE_W,
                } | (Self::ARG_MASK & distance))
            }
            Command::Upgrade(c) => {
                Self::UPGRADE
                    | match c {
                        Component::Blasters => 0b00,
                        Component::Thrusters => 0b01,
                        Component::Harvesters => 0b10,
                        Component::Unknown => panic!("can't encode unknown component"),
                    }
            }
            Command::Unknown => panic!("can't encode unknown command"),
        }
    }

    fn decode(cmd: u8) -> Command {
        match cmd & Self::CMD_MASK {
            Self::HOLD => Command::Hold,
            Self::MOVE_N => Command::Move(Direction::North, cmd & Self::ARG_MASK),
            Self::MOVE_E => Command::Move(Direction::East, cmd & Self::ARG_MASK),
            Self::MOVE_S => Command::Move(Direction::South, cmd & Self::ARG_MASK),
            Self::MOVE_W => Command::Move(Direction::West, cmd & Self::ARG_MASK),
            Self::UPGRADE => Command::Upgrade(match cmd & Self::ARG_MASK {
                Self::BLASTERS => Component::Blasters,
                Self::THRUSTERS => Component::Thrusters,
                Self::HARVESTERS => Component::Harvesters,
                _ => Component::Unknown,
            }),
            _ => Command::Unknown,
        }
    }
}
