import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AccountMenu from "./AccountMenu";
import { expect, test, vi } from "vitest";

const user = { firstName: "Test", lastName: "User", email: "test@example.com" };
const logout = { isPending: false, mutate: vi.fn() };

function renderMenu() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AccountMenu user={user} logout={logout} />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
        <Route path="/notifications" element={<div>Notifications Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test("AccountMenu mobile navigation works", async () => {
  renderMenu();
  
  const trigger = screen.getByRole("button", { name: /Open account menu/i });
  fireEvent.click(trigger);
  
  const settingsLink = screen.getByRole("menuitem", { name: /Settings/i });
  expect(settingsLink).toBeInTheDocument();
  
  const menuContainer = trigger.parentElement;
  fireEvent.blur(menuContainer, { relatedTarget: null });
  
  expect(screen.getByRole("menuitem", { name: /Settings/i })).toBeInTheDocument();
  
  fireEvent.click(settingsLink);
  
  expect(await screen.findByText("Settings Page")).toBeInTheDocument();
});

test("AccountMenu closes on desktop when tabbing outside", async () => {
  renderMenu();
  const trigger = screen.getByRole("button", { name: /Open account menu/i });
  fireEvent.click(trigger);
  
  const settingsLink = screen.getByRole("menuitem", { name: /Settings/i });
  expect(settingsLink).toBeInTheDocument();
  
  // Create a dummy element outside to simulate focus change
  const outsideElement = document.createElement('button');
  document.body.appendChild(outsideElement);
  
  const menuContainer = trigger.parentElement;
  fireEvent.blur(menuContainer, { relatedTarget: outsideElement });
  
  // Menu should be closed!
  expect(screen.queryByRole("menuitem", { name: /Settings/i })).not.toBeInTheDocument();
});
