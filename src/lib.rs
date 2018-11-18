extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use std::fmt;
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    height: u32,
    width: u32,
    cells: Vec<Cell>,
}

#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let height = 48;
        let width = 96;
        let cells = (0..width * height)
            .map(|i| if i % 2 == 0 || i % 7 == 0 { Cell::Alive } else { Cell::Dead })
            .collect();

        Universe { cells, height, width }
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let i = self.index(row, col);
                let cell = self.cells[i];
                let live_neighbors = self.live_neighbor_count(row, col);

                next[i] = match (cell, live_neighbors) {
                    (Cell::Dead, 3) | (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    _ => Cell::Dead,
                };
            }
        }

        self.cells = next;
    }
}

impl Universe {
    /// Universe "grid" is a flat vec, so row and column
    /// need conversion to a specific, unique index
    fn index(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn live_neighbor_count(&self, row: u32, col: u32) -> u8 {
        let mut count = 0;

        // Use deltas and modulus to prevent "special-casing" the edges
        // and enabling left edge to "neighbor" right edge, etc.
        for drow in [self.height - 1, 0, 1].iter().cloned() {
            for dcol in [self.width - 1, 0, 1].iter().cloned() {
                // Don't count "self" cell
                if drow == 0 && dcol == 0 { continue; }

                let neighbor_row = (row + drow) % self.height;
                let neighbor_col = (col + dcol) % self.width;
                let i = self.index(neighbor_row, neighbor_col);
                count += self.cells[i] as u8;
            }
        }
        count
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}
