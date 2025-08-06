drop policy "Driver can manage their own shipment" on "common"."cargo_shipments";

drop policy "Service members and admins can view all career history" on "common"."character_career_history";

drop policy "User can view their own character career history" on "common"."character_career_history";

drop policy "Service members and admins can see all qualifications" on "common"."character_qualifications";

drop policy "Users can see their own qualifications" on "common"."character_qualifications";

drop policy "Company owner and employee can see entry" on "common"."company_employees";

drop policy "Company owner can manage employees" on "common"."company_employees";

drop policy "LEO can manage impounded vehicles" on "common"."impounded_vehicles";

drop policy "Vehicle owner can see their impounded vehicle" on "common"."impounded_vehicles";

drop policy "Owner can manage their own pets" on "common"."pets";

drop policy "LEO can view all vehicles" on "common"."vehicles";

drop policy "Owner can manage their own vehicle" on "common"."vehicles";

drop policy "LEO can view all registered weapons" on "common"."weapons";

drop policy "Owner can view their own weapons" on "common"."weapons";

alter table "common"."cargo_shipments" drop constraint "cargo_shipments_driver_character_id_fkey";

alter table "common"."cargo_shipments" drop constraint "cargo_shipments_vehicle_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_approved_by_character_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_character_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_department_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_division_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_rank_id_fkey";

alter table "common"."character_career_history" drop constraint "character_career_history_unit_id_fkey";

alter table "common"."character_qualifications" drop constraint "character_qualifications_character_id_fkey";

alter table "common"."character_qualifications" drop constraint "character_qualifications_issued_by_character_id_fkey";

alter table "common"."character_qualifications" drop constraint "character_qualifications_qualification_id_fkey";

alter table "common"."company_employees" drop constraint "company_employees_character_id_fkey";

alter table "common"."company_employees" drop constraint "company_employees_company_id_fkey";

alter table "common"."divisions" drop constraint "divisions_department_id_fkey";

alter table "common"."ems_profiles" drop constraint "ems_profiles_department_id_fkey";

alter table "common"."ems_profiles" drop constraint "ems_profiles_division_id_fkey";

alter table "common"."ems_profiles" drop constraint "ems_profiles_id_fkey";

alter table "common"."ems_profiles" drop constraint "ems_profiles_rank_id_fkey";

alter table "common"."impounded_vehicles" drop constraint "impounded_vehicles_impound_lot_id_fkey";

alter table "common"."impounded_vehicles" drop constraint "impounded_vehicles_impounding_officer_id_fkey";

alter table "common"."impounded_vehicles" drop constraint "impounded_vehicles_release_officer_id_fkey";

alter table "common"."impounded_vehicles" drop constraint "impounded_vehicles_vehicle_id_fkey";

alter table "common"."leo_profiles" drop constraint "leo_profiles_department_id_fkey";

alter table "common"."leo_profiles" drop constraint "leo_profiles_division_id_fkey";

alter table "common"."leo_profiles" drop constraint "leo_profiles_id_fkey";

alter table "common"."leo_profiles" drop constraint "leo_profiles_rank_id_fkey";

alter table "common"."pets" drop constraint "pets_character_id_fkey";

alter table "common"."qualifications" drop constraint "qualifications_department_id_fkey";

alter table "common"."qualifications" drop constraint "qualifications_division_id_fkey";

alter table "common"."ranks" drop constraint "ranks_department_id_fkey";

alter table "common"."units" drop constraint "units_department_id_fkey";

alter table "common"."vehicles" drop constraint "vehicles_character_id_fkey";

alter table "common"."weapons" drop constraint "weapons_character_id_fkey";

alter table "common"."vehicles" alter column "insurance_status" set data type vehicle_insurance_status using "insurance_status"::text::vehicle_insurance_status;

alter table "common"."vehicles" alter column "registration_status" set data type vehicle_registration_status using "registration_status"::text::vehicle_registration_status;

alter table "common"."weapons" alter column "registration_status" set default 'registered'::weapon_registration_status;

alter table "common"."weapons" alter column "registration_status" set data type weapon_registration_status using "registration_status"::text::weapon_registration_status;

alter table "common"."cargo_shipments" add constraint "cargo_shipments_driver_character_id_fkey" FOREIGN KEY (driver_character_id) REFERENCES characters(id) ON DELETE SET NULL not valid;

alter table "common"."cargo_shipments" validate constraint "cargo_shipments_driver_character_id_fkey";

alter table "common"."cargo_shipments" add constraint "cargo_shipments_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL not valid;

alter table "common"."cargo_shipments" validate constraint "cargo_shipments_vehicle_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_approved_by_character_id_fkey" FOREIGN KEY (approved_by_character_id) REFERENCES characters(id) ON DELETE SET NULL not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_approved_by_character_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_character_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_department_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_division_id_fkey" FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_division_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_rank_id_fkey" FOREIGN KEY (rank_id) REFERENCES ranks(id) ON DELETE SET NULL not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_rank_id_fkey";

alter table "common"."character_career_history" add constraint "character_career_history_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL not valid;

alter table "common"."character_career_history" validate constraint "character_career_history_unit_id_fkey";

alter table "common"."character_qualifications" add constraint "character_qualifications_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."character_qualifications" validate constraint "character_qualifications_character_id_fkey";

alter table "common"."character_qualifications" add constraint "character_qualifications_issued_by_character_id_fkey" FOREIGN KEY (issued_by_character_id) REFERENCES characters(id) ON DELETE SET NULL not valid;

alter table "common"."character_qualifications" validate constraint "character_qualifications_issued_by_character_id_fkey";

alter table "common"."character_qualifications" add constraint "character_qualifications_qualification_id_fkey" FOREIGN KEY (qualification_id) REFERENCES qualifications(id) ON DELETE CASCADE not valid;

alter table "common"."character_qualifications" validate constraint "character_qualifications_qualification_id_fkey";

alter table "common"."company_employees" add constraint "company_employees_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."company_employees" validate constraint "company_employees_character_id_fkey";

alter table "common"."company_employees" add constraint "company_employees_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "common"."company_employees" validate constraint "company_employees_company_id_fkey";

alter table "common"."divisions" add constraint "divisions_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE not valid;

alter table "common"."divisions" validate constraint "divisions_department_id_fkey";

alter table "common"."ems_profiles" add constraint "ems_profiles_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT not valid;

alter table "common"."ems_profiles" validate constraint "ems_profiles_department_id_fkey";

alter table "common"."ems_profiles" add constraint "ems_profiles_division_id_fkey" FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL not valid;

alter table "common"."ems_profiles" validate constraint "ems_profiles_division_id_fkey";

alter table "common"."ems_profiles" add constraint "ems_profiles_id_fkey" FOREIGN KEY (id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."ems_profiles" validate constraint "ems_profiles_id_fkey";

alter table "common"."ems_profiles" add constraint "ems_profiles_rank_id_fkey" FOREIGN KEY (rank_id) REFERENCES ranks(id) ON DELETE RESTRICT not valid;

alter table "common"."ems_profiles" validate constraint "ems_profiles_rank_id_fkey";

alter table "common"."impounded_vehicles" add constraint "impounded_vehicles_impound_lot_id_fkey" FOREIGN KEY (impound_lot_id) REFERENCES impound_lots(id) ON DELETE RESTRICT not valid;

alter table "common"."impounded_vehicles" validate constraint "impounded_vehicles_impound_lot_id_fkey";

alter table "common"."impounded_vehicles" add constraint "impounded_vehicles_impounding_officer_id_fkey" FOREIGN KEY (impounding_officer_id) REFERENCES characters(id) ON DELETE SET NULL not valid;

alter table "common"."impounded_vehicles" validate constraint "impounded_vehicles_impounding_officer_id_fkey";

alter table "common"."impounded_vehicles" add constraint "impounded_vehicles_release_officer_id_fkey" FOREIGN KEY (release_officer_id) REFERENCES characters(id) ON DELETE SET NULL not valid;

alter table "common"."impounded_vehicles" validate constraint "impounded_vehicles_release_officer_id_fkey";

alter table "common"."impounded_vehicles" add constraint "impounded_vehicles_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE not valid;

alter table "common"."impounded_vehicles" validate constraint "impounded_vehicles_vehicle_id_fkey";

alter table "common"."leo_profiles" add constraint "leo_profiles_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT not valid;

alter table "common"."leo_profiles" validate constraint "leo_profiles_department_id_fkey";

alter table "common"."leo_profiles" add constraint "leo_profiles_division_id_fkey" FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL not valid;

alter table "common"."leo_profiles" validate constraint "leo_profiles_division_id_fkey";

alter table "common"."leo_profiles" add constraint "leo_profiles_id_fkey" FOREIGN KEY (id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."leo_profiles" validate constraint "leo_profiles_id_fkey";

alter table "common"."leo_profiles" add constraint "leo_profiles_rank_id_fkey" FOREIGN KEY (rank_id) REFERENCES ranks(id) ON DELETE RESTRICT not valid;

alter table "common"."leo_profiles" validate constraint "leo_profiles_rank_id_fkey";

alter table "common"."pets" add constraint "pets_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."pets" validate constraint "pets_character_id_fkey";

alter table "common"."qualifications" add constraint "qualifications_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL not valid;

alter table "common"."qualifications" validate constraint "qualifications_department_id_fkey";

alter table "common"."qualifications" add constraint "qualifications_division_id_fkey" FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL not valid;

alter table "common"."qualifications" validate constraint "qualifications_division_id_fkey";

alter table "common"."ranks" add constraint "ranks_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE not valid;

alter table "common"."ranks" validate constraint "ranks_department_id_fkey";

alter table "common"."units" add constraint "units_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE not valid;

alter table "common"."units" validate constraint "units_department_id_fkey";

alter table "common"."vehicles" add constraint "vehicles_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."vehicles" validate constraint "vehicles_character_id_fkey";

alter table "common"."weapons" add constraint "weapons_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE not valid;

alter table "common"."weapons" validate constraint "weapons_character_id_fkey";

grant delete on table "common"."cargo_shipments" to "service_user";

grant insert on table "common"."cargo_shipments" to "service_user";

grant references on table "common"."cargo_shipments" to "service_user";

grant select on table "common"."cargo_shipments" to "service_user";

grant trigger on table "common"."cargo_shipments" to "service_user";

grant truncate on table "common"."cargo_shipments" to "service_user";

grant update on table "common"."cargo_shipments" to "service_user";

grant delete on table "common"."character_career_history" to "service_user";

grant insert on table "common"."character_career_history" to "service_user";

grant references on table "common"."character_career_history" to "service_user";

grant select on table "common"."character_career_history" to "service_user";

grant trigger on table "common"."character_career_history" to "service_user";

grant truncate on table "common"."character_career_history" to "service_user";

grant update on table "common"."character_career_history" to "service_user";

grant delete on table "common"."character_qualifications" to "service_user";

grant insert on table "common"."character_qualifications" to "service_user";

grant references on table "common"."character_qualifications" to "service_user";

grant select on table "common"."character_qualifications" to "service_user";

grant trigger on table "common"."character_qualifications" to "service_user";

grant truncate on table "common"."character_qualifications" to "service_user";

grant update on table "common"."character_qualifications" to "service_user";

grant delete on table "common"."characters" to "service_user";

grant insert on table "common"."characters" to "service_user";

grant references on table "common"."characters" to "service_user";

grant select on table "common"."characters" to "service_user";

grant trigger on table "common"."characters" to "service_user";

grant truncate on table "common"."characters" to "service_user";

grant update on table "common"."characters" to "service_user";

grant delete on table "common"."companies" to "service_user";

grant insert on table "common"."companies" to "service_user";

grant references on table "common"."companies" to "service_user";

grant select on table "common"."companies" to "service_user";

grant trigger on table "common"."companies" to "service_user";

grant truncate on table "common"."companies" to "service_user";

grant update on table "common"."companies" to "service_user";

grant delete on table "common"."company_employees" to "service_user";

grant insert on table "common"."company_employees" to "service_user";

grant references on table "common"."company_employees" to "service_user";

grant select on table "common"."company_employees" to "service_user";

grant trigger on table "common"."company_employees" to "service_user";

grant truncate on table "common"."company_employees" to "service_user";

grant update on table "common"."company_employees" to "service_user";

grant delete on table "common"."departments" to "service_user";

grant insert on table "common"."departments" to "service_user";

grant references on table "common"."departments" to "service_user";

grant select on table "common"."departments" to "service_user";

grant trigger on table "common"."departments" to "service_user";

grant truncate on table "common"."departments" to "service_user";

grant update on table "common"."departments" to "service_user";

grant delete on table "common"."divisions" to "service_user";

grant insert on table "common"."divisions" to "service_user";

grant references on table "common"."divisions" to "service_user";

grant select on table "common"."divisions" to "service_user";

grant trigger on table "common"."divisions" to "service_user";

grant truncate on table "common"."divisions" to "service_user";

grant update on table "common"."divisions" to "service_user";

grant delete on table "common"."ems_profiles" to "service_user";

grant insert on table "common"."ems_profiles" to "service_user";

grant references on table "common"."ems_profiles" to "service_user";

grant select on table "common"."ems_profiles" to "service_user";

grant trigger on table "common"."ems_profiles" to "service_user";

grant truncate on table "common"."ems_profiles" to "service_user";

grant update on table "common"."ems_profiles" to "service_user";

grant delete on table "common"."impound_lots" to "service_user";

grant insert on table "common"."impound_lots" to "service_user";

grant references on table "common"."impound_lots" to "service_user";

grant select on table "common"."impound_lots" to "service_user";

grant trigger on table "common"."impound_lots" to "service_user";

grant truncate on table "common"."impound_lots" to "service_user";

grant update on table "common"."impound_lots" to "service_user";

grant delete on table "common"."impounded_vehicles" to "service_user";

grant insert on table "common"."impounded_vehicles" to "service_user";

grant references on table "common"."impounded_vehicles" to "service_user";

grant select on table "common"."impounded_vehicles" to "service_user";

grant trigger on table "common"."impounded_vehicles" to "service_user";

grant truncate on table "common"."impounded_vehicles" to "service_user";

grant update on table "common"."impounded_vehicles" to "service_user";

grant delete on table "common"."leo_profiles" to "service_user";

grant insert on table "common"."leo_profiles" to "service_user";

grant references on table "common"."leo_profiles" to "service_user";

grant select on table "common"."leo_profiles" to "service_user";

grant trigger on table "common"."leo_profiles" to "service_user";

grant truncate on table "common"."leo_profiles" to "service_user";

grant update on table "common"."leo_profiles" to "service_user";

grant delete on table "common"."pets" to "service_user";

grant insert on table "common"."pets" to "service_user";

grant references on table "common"."pets" to "service_user";

grant select on table "common"."pets" to "service_user";

grant trigger on table "common"."pets" to "service_user";

grant truncate on table "common"."pets" to "service_user";

grant update on table "common"."pets" to "service_user";

grant delete on table "common"."qualifications" to "service_user";

grant insert on table "common"."qualifications" to "service_user";

grant references on table "common"."qualifications" to "service_user";

grant select on table "common"."qualifications" to "service_user";

grant trigger on table "common"."qualifications" to "service_user";

grant truncate on table "common"."qualifications" to "service_user";

grant update on table "common"."qualifications" to "service_user";

grant delete on table "common"."ranks" to "service_user";

grant insert on table "common"."ranks" to "service_user";

grant references on table "common"."ranks" to "service_user";

grant select on table "common"."ranks" to "service_user";

grant trigger on table "common"."ranks" to "service_user";

grant truncate on table "common"."ranks" to "service_user";

grant update on table "common"."ranks" to "service_user";

grant delete on table "common"."units" to "service_user";

grant insert on table "common"."units" to "service_user";

grant references on table "common"."units" to "service_user";

grant select on table "common"."units" to "service_user";

grant trigger on table "common"."units" to "service_user";

grant truncate on table "common"."units" to "service_user";

grant update on table "common"."units" to "service_user";

grant delete on table "common"."vehicles" to "service_user";

grant insert on table "common"."vehicles" to "service_user";

grant references on table "common"."vehicles" to "service_user";

grant select on table "common"."vehicles" to "service_user";

grant trigger on table "common"."vehicles" to "service_user";

grant truncate on table "common"."vehicles" to "service_user";

grant update on table "common"."vehicles" to "service_user";

grant delete on table "common"."weapons" to "service_user";

grant insert on table "common"."weapons" to "service_user";

grant references on table "common"."weapons" to "service_user";

grant select on table "common"."weapons" to "service_user";

grant trigger on table "common"."weapons" to "service_user";

grant truncate on table "common"."weapons" to "service_user";

grant update on table "common"."weapons" to "service_user";

create policy "Driver can manage their own shipment"
on "common"."cargo_shipments"
as permissive
for all
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = cargo_shipments.driver_character_id)) = auth.uid()))
with check ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = cargo_shipments.driver_character_id)) = auth.uid()));


create policy "Service members and admins can view all career history"
on "common"."character_career_history"
as permissive
for select
to public
using (((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::user_role) OR (EXISTS ( SELECT 1
   FROM characters c
  WHERE ((c.user_id = auth.uid()) AND ((c.id IN ( SELECT leo_profiles.id
           FROM leo_profiles)) OR (c.id IN ( SELECT ems_profiles.id
           FROM ems_profiles))))))));


create policy "User can view their own character career history"
on "common"."character_career_history"
as permissive
for select
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = character_career_history.character_id)) = auth.uid()));


create policy "Service members and admins can see all qualifications"
on "common"."character_qualifications"
as permissive
for select
to public
using (((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::user_role) OR (EXISTS ( SELECT 1
   FROM characters c
  WHERE ((c.user_id = auth.uid()) AND ((c.id IN ( SELECT leo_profiles.id
           FROM leo_profiles)) OR (c.id IN ( SELECT ems_profiles.id
           FROM ems_profiles))))))));


create policy "Users can see their own qualifications"
on "common"."character_qualifications"
as permissive
for select
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = character_qualifications.character_id)) = auth.uid()));


create policy "Company owner and employee can see entry"
on "common"."company_employees"
as permissive
for select
to public
using (((( SELECT companies.owner_id
   FROM companies
  WHERE (companies.id = company_employees.company_id)) = auth.uid()) OR (( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = company_employees.character_id)) = auth.uid())));


create policy "Company owner can manage employees"
on "common"."company_employees"
as permissive
for all
to public
using ((( SELECT companies.owner_id
   FROM companies
  WHERE (companies.id = company_employees.company_id)) = auth.uid()));


create policy "LEO can manage impounded vehicles"
on "common"."impounded_vehicles"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM leo_profiles
  WHERE (leo_profiles.id = ( SELECT units_on_duty.character_id
           FROM units_on_duty
          WHERE (units_on_duty.user_id = auth.uid())
         LIMIT 1)))));


create policy "Vehicle owner can see their impounded vehicle"
on "common"."impounded_vehicles"
as permissive
for select
to public
using ((( SELECT vehicles.character_id AS owner_id
   FROM vehicles
  WHERE (vehicles.id = impounded_vehicles.vehicle_id)) = ( SELECT characters.id
   FROM characters
  WHERE (characters.user_id = auth.uid())
 LIMIT 1)));


create policy "Owner can manage their own pets"
on "common"."pets"
as permissive
for all
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = pets.character_id)) = auth.uid()))
with check ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = pets.character_id)) = auth.uid()));


create policy "LEO can view all vehicles"
on "common"."vehicles"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM leo_profiles
  WHERE (leo_profiles.id = ( SELECT units_on_duty.character_id
           FROM units_on_duty
          WHERE (units_on_duty.user_id = auth.uid())
         LIMIT 1)))));


create policy "Owner can manage their own vehicle"
on "common"."vehicles"
as permissive
for all
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = vehicles.character_id)) = auth.uid()))
with check ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = vehicles.character_id)) = auth.uid()));


create policy "LEO can view all registered weapons"
on "common"."weapons"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM leo_profiles
  WHERE (leo_profiles.id = ( SELECT units_on_duty.character_id
           FROM units_on_duty
          WHERE (units_on_duty.user_id = auth.uid())
         LIMIT 1)))));


create policy "Owner can view their own weapons"
on "common"."weapons"
as permissive
for select
to public
using ((( SELECT characters.user_id AS owner_id
   FROM characters
  WHERE (characters.id = characters.user_id)) = auth.uid()));



