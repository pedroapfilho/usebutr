"use client";

import { useStaticSearch } from "fumadocs-core/search/client/orama-static";
import {
  SearchDialog as FumadocsSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import type { SharedProps } from "fumadocs-ui/contexts/search";

const SearchDialog = (props: SharedProps) => {
  const { data, isLoading, onSearchChange, search } = useStaticSearch();

  return (
    <FumadocsSearchDialog
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      search={search}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={data ? data.items : null} />
      </SearchDialogContent>
    </FumadocsSearchDialog>
  );
};

export { SearchDialog };
